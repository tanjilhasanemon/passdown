import { apiClient } from "./client";
import type {
  AuditActivityFilters,
  AuditLogItem,
  PaginatedResponse,
  PlatformStats,
  PurgeActivityResult,
  SecurityOverview,
  User,
} from "../types";

export const adminApi = {
  async getStats(): Promise<PlatformStats> {
    const response = await apiClient.get<PlatformStats>("/admin/stats", {
      params: { _t: Date.now() },
    });
    return response.data;
  },

  async listUsers(params?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(
      "/admin/users",
      {
        params: {
          limit: params?.limit ?? 100,
          offset: params?.offset ?? 0,
          _t: Date.now(),
        },
      }
    );
    return response.data;
  },

  async setUserActive(userId: number, isActive: boolean): Promise<User> {
    const response = await apiClient.patch<User>(
      `/admin/users/${userId}/active`,
      { is_active: isActive }
    );
    return response.data;
  },

  async unlockUser(userId: number): Promise<User> {
    const response = await apiClient.post<User>(`/admin/users/${userId}/unlock`);
    return response.data;
  },

  async getActivity(params?: {
    q?: string;
    user_email?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<AuditLogItem>> {
    const response = await apiClient.get<PaginatedResponse<AuditLogItem>>(
      "/admin/activity",
      {
        params: {
          q: params?.q || undefined,
          user_email: params?.user_email || undefined,
          action: params?.action || undefined,
          date_from: params?.date_from || undefined,
          date_to: params?.date_to || undefined,
          limit: params?.limit ?? 15,
          offset: params?.offset ?? 0,
          _t: Date.now(),
        },
      }
    );
    return response.data;
  },

  async getActivityFilters(): Promise<AuditActivityFilters> {
    const response = await apiClient.get<AuditActivityFilters>(
      "/admin/activity/filters",
      { params: { _t: Date.now() } }
    );
    return response.data;
  },

  async exportActivityCsv(params?: {
    q?: string;
    user_email?: string;
    action?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<void> {
    const response = await apiClient.get<Blob>("/admin/activity/export", {
      params: {
        q: params?.q || undefined,
        user_email: params?.user_email || undefined,
        action: params?.action || undefined,
        date_from: params?.date_from || undefined,
        date_to: params?.date_to || undefined,
      },
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `passdown-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async purgeActivity(olderThanDays = 30): Promise<PurgeActivityResult> {
    const response = await apiClient.delete<PurgeActivityResult>(
      "/admin/activity/purge",
      { params: { older_than_days: olderThanDays } }
    );
    return response.data;
  },

  async getSecurityOverview(params?: {
    min_failures?: number;
    hours?: number;
  }): Promise<SecurityOverview> {
    const response = await apiClient.get<SecurityOverview>("/admin/security", {
      params: {
        min_failures: params?.min_failures ?? 3,
        hours: params?.hours ?? 24,
        _t: Date.now(),
      },
    });
    return response.data;
  },
};
