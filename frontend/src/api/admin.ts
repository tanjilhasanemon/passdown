import { apiClient } from "./client";
import type { PaginatedResponse, PlatformStats, User } from "../types";

export const adminApi = {
  async getStats(): Promise<PlatformStats> {
    const response = await apiClient.get<PlatformStats>("/admin/stats");
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
};
