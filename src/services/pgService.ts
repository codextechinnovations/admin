import { get, post, put, del } from './apiClient';
import { ApiResponse, PG } from '../types/api';

export const pgService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<PG[]>> => {
    return await get<ApiResponse<PG[]>>('/pg', { params });
  },

  getById: async (id: string): Promise<ApiResponse<PG>> => {
    return await get<ApiResponse<PG>>(`/pg/${id}`);
  },

  create: async (pgData: Partial<PG>): Promise<ApiResponse<PG>> => {
    return await post<ApiResponse<PG>>('/pg', pgData);
  },

  update: async (id: string, pgData: Partial<PG>): Promise<ApiResponse<PG>> => {
    return await put<ApiResponse<PG>>(`/pg/${id}`, pgData);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await del<ApiResponse<null>>(`/pg/${id}`);
  },

  updateVerification: async (id: string, verificationData: { isVerified: boolean; fireSafety?: boolean; cctv?: boolean; policeVerification?: boolean }): Promise<ApiResponse<PG>> => {
    return await put<ApiResponse<PG>>(`/pg/${id}/verification`, verificationData);
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/dashboard/summary');
  }
};