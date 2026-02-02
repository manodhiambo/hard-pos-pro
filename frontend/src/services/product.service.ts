import { apiService } from './api';
import { ApiResponse, PaginatedResponse, Product, ProductForm } from '../types';

export const productService = {
  // Get all products
  async getAll(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    productType?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.productType) queryParams.append('productType', params.productType);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    return apiService.get<PaginatedResponse<Product>>(`/products?${queryParams.toString()}`);
  },

  // Get product by ID
  async getById(id: string): Promise<Product> {
    const response = await apiService.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  // Get product by barcode
  async getByBarcode(barcode: string): Promise<Product> {
    const response = await apiService.get<ApiResponse<Product>>(`/products/barcode/${barcode}`);
    return response.data;
  },

  // Create product
  async create(data: ProductForm): Promise<Product> {
    const response = await apiService.post<ApiResponse<Product>>('/products', data);
    return response.data;
  },

  // Update product
  async update(id: string, data: Partial<ProductForm>): Promise<Product> {
    const response = await apiService.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  async delete(id: string): Promise<void> {
    await apiService.delete(`/products/${id}`);
  },

  // Get low stock products
  async getLowStock(): Promise<Product[]> {
    const response = await apiService.get<ApiResponse<Product[]>>('/products/low-stock');
    return response.data;
  },
};
