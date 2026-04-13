import { get, post } from './apiClient';
import { ApiResponse } from '../types/api';

export const notificationService = {
  sendNotification: async (data: { title: string; message: string; target: string; pgId?: string }): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/notifications/send', data);
  },

  getNotifications: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/notifications', { params });
  },

  getRecentNotifications: async (): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/notifications/recent');
  }
};
