// src/types/settings.ts

export interface OfficeShippingAddress {
  province_id?: number;
  regency_id?: number;
  district_id?: number;
  village_id?: number;
  full_address: string;
  postal_code: string;
}

export interface Setting {
  id: number;
  key: string;
  value: any;
  group?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: number;
  name: string;
}

export interface Province extends Region {}
export interface Regency extends Region {
  province_id: number;
}
export interface District extends Region {
  regency_id: number;
}
export interface Village extends Region {
  district_id: number;
}
