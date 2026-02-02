import { apiService } from './api';
import { ApiResponse, DashboardStats } from '../types';

export const dashboardService = {
  // Get dashboard statistics
  async getStats(): Promise<DashboardStats> {
    const response = await apiService.get<ApiResponse<DashboardStats>>('/reports/dashboard');
    return response.data;
  },

  // Get sales report
  async getSalesReport(params?: {
    startDate?: string;
    endDate?: string;
    branchId?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.branchId) queryParams.append('branchId', params.branchId);

    const response = await apiService.get<ApiResponse<any>>(`/reports/sales?${queryParams.toString()}`);
    return response.data;
  },

  // Get inventory report
  async getInventoryReport(params?: {
    branchId?: string;
    categoryId?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.branchId) queryParams.append('branchId', params.branchId);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);

    const response = await apiService.get<ApiResponse<any>>(`/reports/inventory?${queryParams.toString()}`);
    return response.data;
  },
};
