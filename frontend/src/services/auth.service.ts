import { apiService } from './api';
import { ApiResponse, User, LoginForm } from '../types';

export const authService = {
  // Login
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    const response = await apiService.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/login',
      credentials
    );
    
    // Save token and user to localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  },
};
