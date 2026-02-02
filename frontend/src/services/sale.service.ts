import { apiService } from './api';
import { ApiResponse, PaginatedResponse, Sale, SaleForm } from '../types';

export const saleService = {
  // Get all sales
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    customerId?: string;
    saleType?: string;
    saleStatus?: string;
    paymentStatus?: string;
  }): Promise<PaginatedResponse<Sale>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.saleType) queryParams.append('saleType', params.saleType);
    if (params?.saleStatus) queryParams.append('saleStatus', params.saleStatus);
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);

    return apiService.get<PaginatedResponse<Sale>>(`/sales?${queryParams.toString()}`);
  },

  // Get sale by ID
  async getById(id: string): Promise<Sale> {
    const response = await apiService.get<ApiResponse<Sale>>(`/sales/${id}`);
    return response.data;
  },

  // Get today's sales
  async getToday(): Promise<{ sales: Sale[]; count: number; totalRevenue: number }> {
    const response = await apiService.get<ApiResponse<{ sales: Sale[]; count: number; totalRevenue: number }>>('/sales/today');
    return response.data;
  },

  // Create sale
  async create(data: SaleForm): Promise<Sale> {
    const response = await apiService.post<ApiResponse<Sale>>('/sales', data);
    return response.data;
  },

  // Cancel sale
  async cancel(id: string, reason?: string): Promise<void> {
    await apiService.put(`/sales/${id}/cancel`, { reason });
  },

  // Get sales summary
  async getSummary(params?: {
    startDate?: string;
    endDate?: string;
    branchId?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.branchId) queryParams.append('branchId', params.branchId);

    const response = await apiService.get<ApiResponse<any>>(`/sales/summary?${queryParams.toString()}`);
    return response.data;
  },
};
