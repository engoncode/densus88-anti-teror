// src/types/artist.ts
import type { User } from './common';

export interface ArtistProfile {
  id: number;
  user_id?: number;
  name: string;
  slug: string;
  bio?: string;
  specialization?: string;
  artist_category?: string;
  artistic_statement?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  province_id?: number;
  regency_id?: number;
  district_id?: number;
  village_id?: number;
  postal_code?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  sample_artwork_title?: string;
  sample_artwork_description?: string;
  sample_artwork_image?: string;
  sample_artwork_medium?: string;
  sample_artwork_year?: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  verified_at?: string;
  verified_by?: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface CreateManualArtistData {
  name: string;
  bio?: string;
  specialization?: string;
  artist_category?: string;
  artistic_statement?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  province_id?: number;
  regency_id?: number;
  district_id?: number;
  village_id?: number;
  postal_code?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  sample_artwork_image?: File;
  sample_artwork_title?: string;
  sample_artwork_description?: string;
  sample_artwork_medium?: string;
  sample_artwork_year?: number;
}

export interface VerifyDirectData {
  status: 'approved' | 'rejected';
  notes?: string;
}

export interface VerifyLinkData {
  user_id: number;
  artist_profile_id: number;
  merge_sample_artwork?: boolean;
  notes?: string;
}

export interface CreateArtistWithUserData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  specialization?: string;
  artist_category?: string;
  artistic_statement?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  province_id?: number;
  regency_id?: number;
  district_id?: number;
  village_id?: number;
  postal_code?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

export interface UpdateArtistData {
  name?: string;
  bio?: string;
  specialization?: string;
  artist_category?: string;
  artistic_statement?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  province_id?: number;
  regency_id?: number;
  district_id?: number;
  village_id?: number;
  postal_code?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}
