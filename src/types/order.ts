// src/types/order.ts
import type { User } from './common';
import type { Artwork } from './artwork';

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  shipping_address_id: number;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  voucher_id?: number;
  voucher_code?: string;
  total: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string;
  xendit_invoice_id?: string;
  invoice_url?: string;
  payment_channel?: string;
  va_number?: string;
  paid_at?: string;
  shipping_courier?: string;
  shipping_service?: string;
  tracking_number?: string;
  shipping_address_snapshot?: ShippingAddressSnapshot;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  customer_notes?: string;
  admin_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  items?: OrderItem[];
  vendor_types?: ('artist' | 'lapalapa')[];
  is_mixed?: boolean;
}

export interface OrderItem {
  id: number;
  order_id: number;
  artwork_id: number;
  artwork_title: string;
  artwork_sku?: string;
  price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  artwork?: Artwork & {
    vendor_type: 'artist' | 'lapalapa';
  };
}

export interface ShippingAddressSnapshot {
  name: string;
  phone: string;
  address: string;
  province: string;
  regency: string;
  district?: string;
  village?: string;
  postal_code: string;
}

export interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  pending_payment: number;

  // Artwork statistics
  total_artworks: number;
  total_artwork_views: number;
  lapalapa_artworks: number;
  artist_artworks: number;

  // Views trend
  views_trend: Array<{
    date: string;
    views: number;
  }>;
}
