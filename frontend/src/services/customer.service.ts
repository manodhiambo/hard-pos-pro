import { apiService } from './api';
import { ApiResponse, PaginatedResponse, Customer } from '../types';

export const customerService = {
  // Get all customers
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    customerType?: string;
    creditStatus?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Customer>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.customerType) queryParams.append('customerType', params.customerType);
    if (params?.creditStatus) queryParams.append('creditStatus', params.creditStatus);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return apiService.get<PaginatedResponse<Customer>>(`/customers?${queryParams.toString()}`);
  },

  // Get customer by ID
  async getById(id: string): Promise<Customer> {
    const response = await apiService.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  // Create customer
  async create(data: Partial<Customer>): Promise<Customer> {
    const response = await apiService.post<ApiResponse<Customer>>('/customers', data);
    return response.data;
  },

  // Update customer
  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await apiService.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data;
  },

  // Get customer statement
  async getStatement(id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiService.get<ApiResponse<any>>(`/customers/${id}/statement?${queryParams.toString()}`);
    return response.data;
  },
};
