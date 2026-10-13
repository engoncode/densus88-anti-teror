// src/services/paymentSimulatorService.ts
import { apiService } from './api';

const api = apiService.getInstance();

export interface SimulatorOrder {
  id: number;
  order_number: string;
  va_number: string;
  xendit_va_id?: string;
  bank: string;
  amount: number;
  amount_formatted: string;
  payment_status: string;
  order_status?: string;
  customer: string;
  created_at?: string;
}

export interface SimulatePaymentResponse {
  success: boolean;
  message: string;
  order_number?: string;
  amount?: number;
  amount_formatted?: string;
  xendit_response?: any;
  error?: string;
}

export const paymentSimulatorService = {
  // Search order by VA number or order number
  async searchOrder(params: { va_number?: string; order_number?: string }): Promise<{
    success: boolean;
    order?: SimulatorOrder;
    message?: string;
  }> {
    const response = await api.get('/admin/simulate/search', { params });
    return response.data;
  },

  // Get recent pending orders
  async getRecentOrders(): Promise<{
    success: boolean;
    orders: SimulatorOrder[];
  }> {
    const response = await api.get('/admin/simulate/recent-orders');
    return response.data;
  },

  // Simulate payment
  async simulatePayment(orderNumber: string, amount: number): Promise<SimulatePaymentResponse> {
    const response = await api.post('/admin/simulate/payment', {
      order_number: orderNumber,
      amount,
    });
    return response.data;
  },
};
