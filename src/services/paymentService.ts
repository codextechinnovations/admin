import { get, post, put, del } from './apiClient';
import { ApiResponse, Payment } from '../types/api';

export const paymentService = {
  getAll: async (params?: { page?: number; limit?: number; month?: number; year?: number; tenantId?: string }): Promise<ApiResponse<Payment[]>> => {
    return await get<ApiResponse<Payment[]>>('/payments', { params });
  },

  getById: async (id: string): Promise<ApiResponse<Payment>> => {
    return await get<ApiResponse<Payment>>(`/payments/${id}`);
  },

  create: async (paymentData: Partial<Payment>): Promise<ApiResponse<Payment>> => {
    return await post<ApiResponse<Payment>>('/payments', paymentData);
  },

  getTenantPayments: async (tenantId: string): Promise<ApiResponse<Payment[]>> => {
    return await get<ApiResponse<Payment[]>>(`/payments/tenant/${tenantId}`);
  },

  getTenantStatement: async (tenantId: string, month: number, year: number): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/payments/tenant/${tenantId}/statement`, { params: { month, year } });
  }
};