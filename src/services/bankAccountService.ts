import { get, post, put, del } from './apiClient';
import { ApiResponse, BankAccount } from '../types/api';

export const bankAccountService = {
  getAll: async (params?: { pgId?: string }): Promise<ApiResponse<BankAccount[]>> => {
    return await get<ApiResponse<BankAccount[]>>('/bank-accounts', { params });
  },

  getById: async (id: string): Promise<ApiResponse<BankAccount>> => {
    return await get<ApiResponse<BankAccount>>(`/bank-accounts/${id}`);
  },

  create: async (accountData: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> => {
    return await post<ApiResponse<BankAccount>>('/bank-accounts', accountData);
  },

  update: async (id: string, accountData: Partial<BankAccount>): Promise<ApiResponse<BankAccount>> => {
    return await put<ApiResponse<BankAccount>>(`/bank-accounts/${id}`, accountData);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await del<ApiResponse<null>>(`/bank-accounts/${id}`);
  }
};