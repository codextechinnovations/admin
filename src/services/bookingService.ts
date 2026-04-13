import { get, post, put } from './apiClient';
import { ApiResponse, Booking } from '../types/api';

export const bookingService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; pgId?: string }): Promise<ApiResponse<Booking[]>> => {
    return await get<ApiResponse<Booking[]>>('/bookings', { params });
  },

  getById: async (id: string): Promise<ApiResponse<Booking>> => {
    return await get<ApiResponse<Booking>>(`/bookings/${id}`);
  },

  create: async (bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> => {
    return await post<ApiResponse<Booking>>('/bookings', bookingData);
  },

  updateStatus: async (id: string, status: string, paymentStatus?: string): Promise<ApiResponse<Booking>> => {
    return await put<ApiResponse<Booking>>(`/bookings/${id}/status`, { status, paymentStatus });
  }
};