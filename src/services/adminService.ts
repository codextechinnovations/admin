import { get, post, put, del } from './apiClient';
import { ApiResponse } from '../types/api';

export const adminService = {
  // Dashboard
  getDashboardStats: async (ownerId?: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/dashboard/stats', { params: { ownerId } });
  },

  // PG Management
  getPGs: async (params?: { page?: number; limit?: number; search?: string; ownerId?: string; type?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/pg', { params });
  },
  getPGById: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/pg/${id}`);
  },
  createPG: async (data: any): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/pg', data);
  },
  verifyPG: async (id: string, data: { isVerified: boolean; fireSafety?: boolean; cctv?: boolean; policeVerification?: boolean }): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/pg/${id}/verify`, data);
  },
  updatePG: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/pg/${id}`, data);
  },
  deletePG: async (id: string): Promise<ApiResponse<any>> => {
    return await del<ApiResponse<any>>(`/admin/pg/${id}`);
  },

  // Tenant Management
  getTenants: async (params?: { page?: number; limit?: number; search?: string; status?: string; pgId?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/tenants', { params });
  },
  getTenantById: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/tenants/${id}`);
  },
  createTenant: async (data: any): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/tenants', data);
  },
  updateTenant: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/tenants/${id}`, data);
  },
  updateTenantStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/tenants/${id}/status`, { status });
  },
  deleteTenant: async (id: string): Promise<ApiResponse<any>> => {
    return await del<ApiResponse<any>>(`/admin/tenants/${id}`);
  },

  // Payment Management
  getPayments: async (params?: { page?: number; limit?: number; type?: string; month?: number; year?: number; tenantId?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/payments', { params });
  },
  getPaymentSummary: async (month?: number, year?: number): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/payments/summary', { params: { month, year } });
  },
  createPayment: async (data: any): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/payments', data);
  },

  // Booking Management
  getBookings: async (params?: { page?: number; limit?: number; status?: string; pgId?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/bookings', { params });
  },
  getBookingById: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/bookings/${id}`);
  },
  updateBookingStatus: async (id: string, data: { status: string; paymentStatus?: string }): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/bookings/${id}/status`, data);
  },
  createBooking: async (data: any): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/bookings', data);
  },

  // Expense Management
  getExpenses: async (params?: { page?: number; limit?: number; pgId?: string; category?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/expenses', { params });
  },
  createExpense: async (data: any): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/expenses', data);
  },

  // Tenant Requests
  getTenantRequests: async (status?: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/tenant-requests', { params: { status } });
  },
  updateTenantRequestStatus: async (id: string, status: string): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/tenant-requests/${id}/status`, { status });
  },

  // Complaint Management
  getComplaints: async (params?: { page?: number; limit?: number; status?: string; priority?: string; pgId?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/complaints', { params });
  },
  getComplaintById: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/complaints/${id}`);
  },
  updateComplaintStatus: async (id: string, data: { status: string; adminNotes?: string }): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/complaints/${id}/status`, data);
  },
  deleteComplaint: async (id: string): Promise<ApiResponse<any>> => {
    return await del<ApiResponse<any>>(`/admin/complaints/${id}`);
  },

  // Admin User Management
  getAdminUsers: async (params?: { page?: number; limit?: number; role?: string; isActive?: boolean }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/admin-users', { params });
  },
  getAdminUserById: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/admin-users/${id}`);
  },
  createAdminUser: async (data: any): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/admin-users', data);
  },
  updateAdminUser: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/admin-users/${id}`, data);
  },
  deleteAdminUser: async (id: string): Promise<ApiResponse<any>> => {
    return await del<ApiResponse<any>>(`/admin/admin-users/${id}`);
  },
  toggleAdminStatus: async (id: string): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/admin-users/${id}/toggle-status`, {});
  },

  // Sales Person Management
  getSalesPersons: async (params?: { search?: string; isActive?: boolean }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/sales-persons', { params });
  },
  createSalesPerson: async (data: { name: string; email: string; phone: string; password: string; role?: string }): Promise<ApiResponse<any>> => {
    return await post<ApiResponse<any>>('/admin/sales-persons', data);
  },
  updateSalesPerson: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/sales-persons/${id}`, data);
  },
  deleteSalesPerson: async (id: string): Promise<ApiResponse<any>> => {
    return await del<ApiResponse<any>>(`/admin/sales-persons/${id}`);
  },
  toggleSalesPersonStatus: async (id: string): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/sales-persons/${id}/toggle-status`, {});
  },

  // PG Owner Management
  getPGOwners: async (params?: { status?: string; search?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/pg-owners', { params });
  },
  getPGOwnerById: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/pg-owners/${id}`);
  },
  getPGOwnerPGs: async (id: string): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>(`/admin/pg-owners/${id}/pgs`);
  },
  verifyPGOwner: async (id: string, data: { status: string; isVerified: boolean }): Promise<ApiResponse<any>> => {
    return await put<ApiResponse<any>>(`/admin/pg-owners/${id}/verify`, data);
  },

  // Reports
  getReports: async (params?: { type?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/reports', { params });
  },
  getMonthlyReport: async (year?: number): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/reports/monthly', { params: { year } });
  },
  getPGPerformance: async (limit?: number): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/admin/reports/pg-performance', { params: { limit } });
  },
  exportReport: (type: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return `${baseUrl}/admin/reports/export?type=${type}`;
  }
};
