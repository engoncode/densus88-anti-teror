import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-service.bytecore.id/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  // Try both token keys for backward compatibility
  const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: {
    id: number;
    name: string;
  };
  workspace: {
    id: number;
    name: string;
  } | null;
  expired: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
  workspace_id?: number | null;
  expired?: string;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
  workspace_id?: number | null;
  expired?: string;
}

// Users API
export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),

  create: (data: CreateUserData) => apiClient.post<User>('/admin/users', data),

  update: (id: number, data: UpdateUserData) => apiClient.put<User>(`/admin/users/${id}`, data),

  block: (id: number) => apiClient.post(`/admin/users/${id}/block`),

  unblock: (id: number) => apiClient.post(`/admin/users/${id}/unblock`),

  addActiveDays: (id: number, days: number) =>
    apiClient.post(`/admin/users/${id}/add-active-days`, { days }),
};

// Workspaces API
export const workspacesApi = {
  getAll: () => apiClient.get<Workspace[]>('/workspaces'),

  getById: (id: number) => apiClient.get<Workspace>(`/workspaces/${id}`),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<Workspace>('/workspaces', data),

  update: (id: number, data: { name: string; description?: string }) =>
    apiClient.put<Workspace>(`/workspaces/${id}`, data),

  delete: (id: number) => apiClient.delete(`/workspaces/${id}`),

  // Super Admin only
  getUsers: (id: number) => apiClient.get<User[]>(`/admin/workspaces/${id}/users`),

  assignUsers: (id: number, userIds: number[]) =>
    apiClient.post(`/admin/workspaces/${id}/assign-users`, { user_ids: userIds }),

  unassignUser: (workspaceId: number, userId: number) =>
    apiClient.post(`/admin/workspaces/${workspaceId}/unassign-user/${userId}`),

  // Analyst assignment (many-to-many)
  assignAnalysts: (id: number, analystIds: number[]) =>
    apiClient.post(`/admin/workspaces/${id}/assign-analysts`, { analyst_ids: analystIds }),

  getAnalysts: (id: number) => apiClient.get<User[]>(`/admin/workspaces/${id}/analysts`),
};

// Roles API
export const rolesApi = {
  getAll: () => apiClient.get<Array<{ id: number; name: string }>>('/roles'),
};

export default apiClient;
