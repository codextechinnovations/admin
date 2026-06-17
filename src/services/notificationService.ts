import { get, post } from './apiClient';
import { ApiResponse } from '../types/api';

interface SendNotificationData {
  title: string;
  message: string;
  target: string;
}

interface SendNotificationResult {
  notification: Record<string, any>;
  recipients: number;
  delivered: number;
  failed: number;
}

interface RecipientCounts {
  all: number;
  owners: number;
  tenants: number;
  active: number;
  pushTokens: number;
}

export const notificationService = {
  sendNotification: async (data: SendNotificationData): Promise<ApiResponse<SendNotificationResult>> => {
    return await post<ApiResponse<SendNotificationResult>>('/admin/notifications/send', data);
  },

  getNotifications: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<any[]>> => {
    return await get<ApiResponse<any[]>>('/admin/notifications', { params });
  },

  getRecentNotifications: async (): Promise<ApiResponse<any[]>> => {
    return await get<ApiResponse<any[]>>('/admin/notifications/recent');
  },

  getRecipientCounts: async (): Promise<ApiResponse<RecipientCounts>> => {
    return await get<ApiResponse<RecipientCounts>>('/admin/notifications/recipients');
  }
};
