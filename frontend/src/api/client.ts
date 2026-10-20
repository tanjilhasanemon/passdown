import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

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
          const cleanMsg = (err.msg ?? "Invalid value").replace(/^Value error,\s*/i, "");
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