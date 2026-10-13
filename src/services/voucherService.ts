// src/services/voucherService.ts
import api from './api';

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  discount_value: string;
  min_purchase: string;
  max_discount: string | null;
  usage_limit: number | null;
  used_count: number;
  usage_limit_per_user: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_to: 'all' | 'categories' | 'artworks' | 'artists';
  applicable_ids: number[] | null;
  created_at: string;
  updated_at: string;
  usages_count?: number;
}

export interface VoucherStatistics {
  total_vouchers: number;
  active_vouchers: number;
  expired_vouchers: number;
  total_usages: number;
}

export interface VoucherFormData {
  code?: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_limit_per_user?: number;
  valid_from: string;
  valid_until: string;
  is_active?: boolean;
  applicable_to?: 'all' | 'categories' | 'artworks' | 'artists';
  applicable_ids?: number[];
}

export interface VoucherUsage {
  id: number;
  user_id: number;
  voucher_id: number;
  order_id: number;
  discount_amount: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  order: {
    id: number;
    order_number: string;
    total_amount: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

class VoucherService {
  async getVouchers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    type?: string;
  }): Promise<{ data: PaginatedResponse<Voucher> }> {
    const response = await api.get('/admin/vouchers', { params });
    return { data: response.data.data };
  }

  async getStatistics(): Promise<VoucherStatistics> {
    const response = await api.get('/admin/vouchers/statistics');
    return response.data.data;
  }

  async getVoucher(id: number): Promise<Voucher> {
    const response = await api.get(`/admin/vouchers/${id}`);
    return response.data.data;
  }

  async createVoucher(data: VoucherFormData): Promise<Voucher> {
    const response = await api.post('/admin/vouchers', data);
    return response.data.data;
  }

  async updateVoucher(id: number, data: Partial<VoucherFormData>): Promise<Voucher> {
    const response = await api.put(`/admin/vouchers/${id}`, data);
    return response.data.data;
  }

  async deleteVoucher(id: number): Promise<void> {
    await api.delete(`/admin/vouchers/${id}`);
  }

  async toggleStatus(id: number): Promise<Voucher> {
    const response = await api.post(`/admin/vouchers/${id}/toggle-status`);
    return response.data.data;
  }

  async getUsageHistory(
    id: number,
    params?: { page?: number; per_page?: number }
  ): Promise<{ data: PaginatedResponse<VoucherUsage> }> {
    const response = await api.get(`/admin/vouchers/${id}/usage-history`, { params });
    return { data: response.data.data };
  }
}

export const voucherService = new VoucherService();
export default voucherService;
