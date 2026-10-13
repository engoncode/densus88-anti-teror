// src/types/artwork.ts
import type { ArtistProfile } from './artist';

export interface Artwork {
  id: number;
  artist_id: number;
  title: string;
  slug: string;
  description?: string;
  category_id: number;
  medium_id: number;
  price: number;
  stock: number;
  year_created?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  length?: number;
  width?: number;
  height?: number;
  weight: number;
  vendor_type: 'artist' | 'lapalapa';
  origin_regency_id?: number;
  is_for_sale: boolean;
  is_limited_edition: boolean;
  edition_number?: number;
  edition_total?: number;
  status: 'active' | 'inactive';
  is_active: boolean;
  image?: string; // Main image URL
  created_at: string;
  updated_at: string;
  artist?: ArtistProfile;
  category?: Category;
  medium?: Medium;
  images?: ArtworkImage[];
}

export interface ArtworkImage {
  id: number;
  artwork_id: number;
  image_url: string; // Changed from image_path
  position: number; // Changed from order and is_primary
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Medium {
  id: number;
  name: string;
  slug: string;
}

export interface CreateArtworkData {
  artist_id: number;
  title: string;
  description?: string;
  category_id: number;
  medium_id: number;
  price: number;
  stock: number;
  year_created?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  length?: number;
  width?: number;
  height?: number;
  weight: number;
  is_for_sale?: boolean;
  is_limited_edition?: boolean;
  edition_number?: number;
  edition_total?: number;
  main_image: File;
  additional_images?: File[];
}
