import { get, put, del } from './apiClient';
import { ApiResponse } from '../types/api';

export type EnquiryStatus = 'pending' | 'approved' | 'rejected';
export type EnquirySource = 'mobile-app' | 'website' | 'admin' | 'other' | 'all';

export interface PgEnquiry {
  _id: string;
  ownerName: string;
  pgName: string;
  phone: string;
  email: string;
  address: string;
  source?: EnquirySource;
  service?: string;
  projectName?: string;
  status: EnquiryStatus;
  remarks?: string;
  reviewedAt?: string;
  reviewedBy?: { _id: string; name?: string; email?: string; role?: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryListResponse {
  success: boolean;
  data: PgEnquiry[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
  stats: {
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  };
}

export interface BulkDeletePayload {
  ids?: string[];
  all?: boolean;
  status?: EnquiryStatus | 'all';
  source?: EnquirySource;
  search?: string;
}

export const enquiryService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: EnquiryStatus | 'all';
    source?: EnquirySource;
    search?: string;
  }): Promise<EnquiryListResponse> => {
    return await get<EnquiryListResponse>('/admin/enquiries', { params });
  },

  getById: async (id: string): Promise<ApiResponse<PgEnquiry>> => {
    return await get<ApiResponse<PgEnquiry>>(`/admin/enquiries/${id}`);
  },

  updateStatus: async (
    id: string,
    data: { status: EnquiryStatus; remarks?: string }
  ): Promise<ApiResponse<PgEnquiry>> => {
    return await put<ApiResponse<PgEnquiry>>(`/admin/enquiries/${id}/status`, data);
  },

  delete: async (id: string): Promise<ApiResponse<{ _id: string }>> => {
    return await del<ApiResponse<{ _id: string }>>(`/admin/enquiries/${id}`);
  },

  deleteBulk: async (payload: BulkDeletePayload): Promise<ApiResponse<{ deletedCount: number }>> => {
    return await del<ApiResponse<{ deletedCount: number }>>('/admin/enquiries', { data: payload });
  },
};

