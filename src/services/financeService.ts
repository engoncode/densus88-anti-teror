// src/services/financeService.ts
import api from './api';

import type { ApiResponse, PaginatedResponse } from '../types/common';

export interface XenditBalance {
  balance: number;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  bank_account_id: number;
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  notes: string | null;
  admin_notes: string | null;
  processed_by: number | null;
  processed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    artist_profile?: {
      id: number;
      name: string;
      slug: string;
    };
  };
  bank_account?: {
    id: number;
    bank_name: string;
    bank_code: string;
    account_number: string;
    account_name: string;
  };
  processed_by_user?: {
    id: number;
    name: string;
  };
}

export interface OrderItemCommission {
  id: number;
  order_number: string | null;
  order_date: string | null;
  artwork_title: string;
  artwork_image: string | null;
  vendor_type: 'artist' | 'lapalapa';
  quantity: number;
  price: string;
  subtotal: string;
  commission_rate: string;
  artist_earnings: string;
  platform_fee: string;
  created_at: string;
}

export interface FinanceStatistics {
  // Overall revenue
  total_revenue: string;
  total_product_sales: string;
  total_shipping_revenue: string;

  // By vendor type
  artist_sales: string;
  lapalapa_sales: string;

  // Commission breakdown
  artist_earnings: string; // 80% of artist sales
  lapalapa_commission: string; // 20% from artist sales
  lapalapa_direct_revenue: string; // 100% from lapalapa sales
  total_lapalapa_revenue: string; // Total LaPalapa earnings

  // Commission rates
  artist_commission_rate: number; // 80
  lapalapa_commission_rate: number; // 20

  // Withdrawal stats
  pending_withdrawals: string;
  processing_withdrawals: string;
  completed_withdrawals: string;
  pending_count: number;
  processing_count: number;

  // Artist wallet stats
  total_artist_balance: string;
  total_pending_balance: string;
  total_artist_withdrawn: string;

  // Order counts
  paid_orders_count: number;
  artist_orders_count: number;
  lapalapa_orders_count: number;

  // Date range info
  date_range?: {
    start_date: string | null;
    end_date: string | null;
    filtered: boolean;
  };
}

class FinanceService {
  async getXenditBalance(): Promise<XenditBalance> {
    const response = await api.get<ApiResponse<XenditBalance>>('/admin/finance/xendit-balance');
    return response.data.data;
  }

  async getStatistics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<FinanceStatistics> {
    const response = await api.get<ApiResponse<FinanceStatistics>>('/admin/finance/statistics', {
      params,
    });
    return response.data.data;
  }

  async getWithdrawals(params?: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<Withdrawal>> {
    const response = await api.get<PaginatedResponse<Withdrawal>>('/admin/finance/withdrawals', {
      params,
    });
    return response.data;
  }

  async getWithdrawal(id: number): Promise<Withdrawal> {
    const response = await api.get<ApiResponse<Withdrawal>>(`/admin/finance/withdrawals/${id}`);
    return response.data.data;
  }

  async approveWithdrawal(id: number): Promise<Withdrawal> {
    const response = await api.post<ApiResponse<Withdrawal>>(
      `/admin/finance/withdrawals/${id}/approve`
    );
    return response.data.data;
  }

  async completeWithdrawal(id: number, adminNotes?: string): Promise<Withdrawal> {
    const response = await api.post<ApiResponse<Withdrawal>>(
      `/admin/finance/withdrawals/${id}/complete`,
      { admin_notes: adminNotes }
    );
    return response.data.data;
  }

  async rejectWithdrawal(id: number, reason: string): Promise<Withdrawal> {
    const response = await api.post<ApiResponse<Withdrawal>>(
      `/admin/finance/withdrawals/${id}/reject`,
      { reason }
    );
    return response.data.data;
  }

  async getOrderItems(params?: {
    start_date?: string;
    end_date?: string;
    vendor_type?: 'artist' | 'lapalapa';
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<OrderItemCommission>> {
    const response = await api.get<PaginatedResponse<OrderItemCommission>>(
      '/admin/finance/order-items',
      { params }
    );
    return response.data;
  }
}

export const financeService = new FinanceService();
export default financeService;
