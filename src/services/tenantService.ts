import { get, post, put, del } from './apiClient';
import { ApiResponse, Tenant } from '../types/api';

export const tenantService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<Tenant[]>> => {
    return await get<ApiResponse<Tenant[]>>('/tenants', { params });
  },

  getById: async (id: string): Promise<ApiResponse<Tenant>> => {
    return await get<ApiResponse<Tenant>>(`/tenants/${id}`);
  },

  create: async (tenantData: Partial<Tenant>): Promise<ApiResponse<Tenant>> => {
    return await post<ApiResponse<Tenant>>('/tenants', tenantData);
  },

  updateStatus: async (id: string, status: string): Promise<ApiResponse<Tenant>> => {
    return await put<ApiResponse<Tenant>>(`/tenants/${id}/status`, { status });
  },

  updateRentStatus: async (id: string, rentStatus: string): Promise<ApiResponse<Tenant>> => {
    return await put<ApiResponse<Tenant>>(`/tenants/${id}/rent-status`, { rentStatus });
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await del<ApiResponse<null>>(`/tenants/${id}`);
  },

  getWithPayments: async (params?: { page?: number; limit?: number; month?: number; year?: number }): Promise<ApiResponse<Tenant[]>> => {
    return await get<ApiResponse<Tenant[]>>('/tenants/with-payments', { params });
  }
};