// src/services/userService.ts
import api from './api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'art_lover' | 'artist' | 'admin';
  avatar: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  email_verified_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
  artist_profile?: {
    id: number;
    display_name: string;
    verification_status: string;
  } | null;
  orders_count?: number;
  total_spent?: string;
}

export interface UserStatistics {
  total_users: number;
  art_lovers: number;
  artists: number;
  admins: number;
  suspended_users: number;
  new_users_this_month: number;
}

export interface UserFormData {
  name?: string;
  email?: string;
  role?: 'art_lover' | 'artist' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class UserService {
  async getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
    status?: string;
    verified?: string;
  }): Promise<{ data: PaginatedResponse<AdminUser> }> {
    const response = await api.get('/admin/users', { params });
    return { data: response.data.data };
  }

  async getStatistics(): Promise<UserStatistics> {
    const response = await api.get('/admin/users/statistics');
    return response.data.data;
  }

  async getUser(id: number): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  }

  async updateUser(id: number, data: UserFormData): Promise<AdminUser> {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }

  async suspendUser(id: number, reason: string): Promise<AdminUser> {
    const response = await api.post(`/admin/users/${id}/suspend`, { reason });
    return response.data.data;
  }

  async unsuspendUser(id: number): Promise<AdminUser> {
    const response = await api.post(`/admin/users/${id}/unsuspend`);
    return response.data.data;
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    await api.post(`/admin/users/${id}/reset-password`, { new_password: newPassword });
  }

  async changeRole(id: number, role: 'art_lover' | 'artist' | 'admin'): Promise<AdminUser> {
    const response = await api.post(`/admin/users/${id}/change-role`, { role });
    return response.data.data;
  }
}

export const userService = new UserService();
export default userService;
