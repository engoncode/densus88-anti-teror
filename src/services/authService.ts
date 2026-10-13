// src/services/authService.ts
import api from './api';

import type { ApiResponse, User } from '../types/common';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface UpdateProfileData {
  name: string;
  username: string;
  email: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Backend returns: { access_token, token_type, user }
    const response = await api.post<{ access_token: string; token_type: string; user: User }>(
      '/login',
      credentials
    );

    const { user, access_token } = response.data;

    // Store auth data with proper key names for sentiment analysis
    localStorage.setItem('access_token', access_token); // Keep consistent with newFeSa
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));

    // Store role and workspace if available
    if (user.role) {
      localStorage.setItem('user_role', user.role.name);
    }
    if (user.workspace?.id) {
      localStorage.setItem('workspace_id', String(user.workspace.id));
    }

    return { user, token: access_token };
  }

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } finally {
      // Clear all auth related data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('workspace_id');
      localStorage.removeItem('cached_topics'); // Clear cached topics
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/user');
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put<{ message: string; user: User }>('/profile', data);
      console.log('Update profile response:', response.data);

      // Backend returns: { message: string, user: User }
      // But the user object may not have full role/workspace nested objects
      // So we refetch the full profile instead
      const updatedUser = await this.getProfile();

      // Update stored user
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async loginWithGoogle(token: string): Promise<LoginResponse> {
    const response = await api.post<{ access_token: string; token_type: string; user: User }>(
      '/auth/google',
      { token }
    );
    const { user, access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    if (user.role) {
      localStorage.setItem('user_role', user.role.name);
    }
    if (user.workspace?.id) {
      localStorage.setItem('workspace_id', String(user.workspace.id));
    }
    return { user, token: access_token };
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.put<{ message?: string }>('/password', data);
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role?.name === 'Super Admin';
  }

  isSuperAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role?.name === 'Super Admin';
  }

  isAnalyst(): boolean {
    const user = this.getStoredUser();
    return user?.role?.name === 'Analyst';
  }

  isOperator(): boolean {
    const user = this.getStoredUser();
    return user?.role?.name === 'Operator';
  }
}

export const authService = new AuthService();
export default authService;
