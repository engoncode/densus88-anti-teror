// src/types/common.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  google_avatar?: string | null;
  role: {
    id: number;
    name: 'Super Admin' | 'Analyst' | 'Operator' | 'Manager' | 'Viewer';
  };
  workspace: {
    id: number;
    name: string;
  } | null;
  expired: string | null;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}
