// src/services/settingsService.ts
import api from './api';

import type { ApiResponse } from '../types/common';
import type { OfficeShippingAddress, Setting, Province, Regency } from '../types/settings';

export interface CommissionSettings {
  artist_commission_rate: number;
  platform_commission_rate: number;
  min_withdrawal_amount: number;
}

export interface PaymentSettings {
  payment_expiry_hours: number;
  min_withdrawal_amount: number;
}

export interface OrderSettings {
  auto_complete_days: number;
}

export interface GeneralSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  site_instagram: string;
  site_facebook: string;
  site_twitter: string;
  site_whatsapp: string;
}

class SettingsService {
  async getAll(group?: string): Promise<Setting[]> {
    const response = await api.get<ApiResponse<Setting[]>>('/admin/settings', {
      params: { group },
    });
    return response.data.data;
  }

  async get(key: string): Promise<any> {
    const response = await api.get<ApiResponse<{ key: string; value: any }>>(
      `/admin/settings/${key}`
    );
    return response.data.data.value;
  }

  async update(key: string, value: any, group?: string, description?: string): Promise<any> {
    const response = await api.put<ApiResponse<{ key: string; value: any }>>(
      `/admin/settings/${key}`,
      {
        value,
        group,
        description,
      }
    );
    return response.data.data.value;
  }

  // Commission Settings
  async getCommissionSettings(): Promise<CommissionSettings> {
    const response = await api.get<ApiResponse<CommissionSettings>>('/admin/settings/commission');
    return response.data.data;
  }

  async updateCommissionSettings(data: {
    artist_commission_rate: number;
    min_withdrawal_amount?: number;
  }): Promise<CommissionSettings> {
    const response = await api.put<ApiResponse<CommissionSettings>>(
      '/admin/settings/commission',
      data
    );
    return response.data.data;
  }

  // Payment Settings
  async getPaymentSettings(): Promise<PaymentSettings> {
    const response = await api.get<ApiResponse<PaymentSettings>>('/admin/settings/payment');
    return response.data.data;
  }

  async updatePaymentSettings(data: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const response = await api.put<ApiResponse<PaymentSettings>>('/admin/settings/payment', data);
    return response.data.data;
  }

  // Order Settings
  async getOrderSettings(): Promise<OrderSettings> {
    const response = await api.get<ApiResponse<OrderSettings>>('/admin/settings/order');
    return response.data.data;
  }

  async updateOrderSettings(data: OrderSettings): Promise<OrderSettings> {
    const response = await api.put<ApiResponse<OrderSettings>>('/admin/settings/order', data);
    return response.data.data;
  }

  // General Settings
  async getGeneralSettings(): Promise<GeneralSettings> {
    const response = await api.get<ApiResponse<GeneralSettings>>('/admin/settings/general');
    return response.data.data;
  }

  async updateGeneralSettings(data: Partial<GeneralSettings>): Promise<GeneralSettings> {
    const response = await api.put<ApiResponse<GeneralSettings>>('/admin/settings/general', data);
    return response.data.data;
  }

  // Office Address
  async getOfficeAddress(): Promise<OfficeShippingAddress> {
    const response = await api.get<ApiResponse<OfficeShippingAddress>>(
      '/admin/settings/office/address'
    );
    return response.data.data;
  }

  async updateOfficeAddress(address: OfficeShippingAddress): Promise<OfficeShippingAddress> {
    const response = await api.put<ApiResponse<OfficeShippingAddress>>(
      '/admin/settings/office/address',
      address
    );
    return response.data.data;
  }

  // Region helpers
  async getProvinces(): Promise<Province[]> {
    const response = await api.get<ApiResponse<Province[]>>('/regions/provinces');
    return response.data.data;
  }

  async getRegencies(provinceId: number): Promise<Regency[]> {
    const response = await api.get<ApiResponse<Regency[]>>(
      `/regions/provinces/${provinceId}/regencies`
    );
    return response.data.data;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
