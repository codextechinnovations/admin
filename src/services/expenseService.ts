import { get, post, put, del } from './apiClient';
import { ApiResponse, Expense } from '../types/api';

export const expenseService = {
  getAll: async (params?: { page?: number; limit?: number; ownerId?: string; pgId?: string; category?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<Expense[]>> => {
    return await get<ApiResponse<Expense[]>>('/expenses', { params });
  },

  getById: async (id: string): Promise<ApiResponse<Expense>> => {
    return await get<ApiResponse<Expense>>(`/expenses/${id}`);
  },

  create: async (expenseData: Partial<Expense>): Promise<ApiResponse<Expense>> => {
    return await post<ApiResponse<Expense>>('/expenses', expenseData);
  },

  update: async (id: string, expenseData: Partial<Expense>): Promise<ApiResponse<Expense>> => {
    return await put<ApiResponse<Expense>>(`/expenses/${id}`, expenseData);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await del<ApiResponse<null>>(`/expenses/${id}`);
  }
};