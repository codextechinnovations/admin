import { get } from './apiClient';
import { ApiResponse, DashboardStats } from '../types/api';

export const dashboardService = {
  getStats: async (pgId?: string): Promise<ApiResponse<DashboardStats>> => {
    return await get<ApiResponse<DashboardStats>>('/dashboard/summary', { params: { pgId } });
  },

  getPaymentSummary: async (month: number, year: number): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/payments/summary', { params: { month, year } });
  },

  getMonthlyReport: async (month: number, year: number): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/payments/report/monthly', { params: { month, year } });
  }
};