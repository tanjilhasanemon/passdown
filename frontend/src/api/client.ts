import axios from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

export const TOKEN_STORAGE_KEY = "passdown_access_token";
export const AUTH_EXPIRED_EVENT = "passdown:auth-expired";

export function getStoredToken(): string | null {
  return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

const CACHE_TTL_MS = 25000;
const responseCache = new Map<string, { timestamp: number; data: unknown }>();

function getCacheKey(config: InternalAxiosRequestConfig): string {
  const token = getStoredToken() ?? "anon";
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${token}:${config.url ?? ""}:${params}`;
}

export function clearApiCache(): void {
  responseCache.clear();
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = (config.method ?? "get").toLowerCase();
  if (method !== "get") {
    responseCache.clear();
    return config;
  }

  const key = getCacheKey(config);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    config.adapter = async (): Promise<AxiosResponse> => ({
      data: cached.data,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const method = (response.config.method ?? "get").toLowerCase();
    if (method === "get" && response.status === 200) {
      const key = getCacheKey(response.config);
      responseCache.set(key, {
        timestamp: Date.now(),
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      if (!requestUrl.includes("/auth/login")) {
        const hadToken = Boolean(getStoredToken());
        setStoredToken(null);
        responseCache.clear();
        if (hadToken) {
          window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
        }
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string | Array<{ loc?: (string | number)[]; msg?: string }> }
      | undefined;

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail
        .map((err) => {
          const field = err.loc?.[err.loc.length - 1];
          const cleanMsg = (err.msg ?? "Invalid value").replace(
            /^Value error,\s*/i,
            ""
          );
          return field ? `${String(field)}: ${cleanMsg}` : cleanMsg;
        })
        .join(" • ");
    }

    if (error.message) {
      return error.message;
    }
  }
  return error instanceof Error ? error.message : "An unexpected error occurred";
}
