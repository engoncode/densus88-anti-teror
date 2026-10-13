// src/services/orderService.ts
import api from './api';

import type { Order, OrderStatistics } from '../types/order';
import type { ApiResponse, PaginatedResponse } from '../types/common';

class OrderService {
  async getAll(params?: {
    vendor_type?: 'all' | 'artist' | 'lapalapa';
    payment_status?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/admin/orders', { params });
    return response.data;
  }

  async getById(orderNumber: string): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(`/admin/orders/${orderNumber}`);
    return response.data.data;
  }

  async updateStatus(orderNumber: string, status: Order['status']): Promise<Order> {
    const response = await api.put<ApiResponse<Order>>(`/admin/orders/${orderNumber}/status`, {
      status,
    });
    return response.data.data;
  }

  async updateTracking(
    orderNumber: string,
    tracking_number: string,
    shipping_courier?: string
  ): Promise<Order> {
    const response = await api.put<ApiResponse<Order>>(`/admin/orders/${orderNumber}/tracking`, {
      tracking_number,
      shipping_courier,
    });
    return response.data.data;
  }

  async addNotes(orderNumber: string, notes: string): Promise<Order> {
    const response = await api.put<ApiResponse<Order>>(`/admin/orders/${orderNumber}/notes`, {
      notes,
    });
    return response.data.data;
  }

  async requestPickup(orderNumber: string, pickupNotes?: string): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      `/admin/orders/${orderNumber}/request-pickup`,
      {
        pickup_notes: pickupNotes,
      }
    );
    return response.data.data;
  }

  async getStatistics(): Promise<OrderStatistics> {
    const response = await api.get<ApiResponse<OrderStatistics>>('/admin/orders/statistics');
    return response.data.data;
  }
}

export const orderService = new OrderService();
export default orderService;
