// src/services/exhibitionService.ts
import api from './api';

import type { ApiResponse, PaginatedResponse } from '../types/common';

export interface ExhibitionArtwork {
  id: number;
  title: string;
  slug?: string;
  image?: string;
  // Alternative fields from admin artworks endpoint
  images?: Array<{ id: number; path: string; is_main: boolean }>;
  price?: number;
  artist?: {
    id: number;
    name: string;
  };
  pivot?: {
    display_order: number;
    is_featured: boolean;
    notes: string | null;
  };
}

export interface ExhibitionArtist {
  id: number;
  name: string;
  avatar: string | null;
  pivot?: {
    artworks_count: number;
  };
}

export interface Exhibition {
  id: number;
  title: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string | null;
  cover_image: string | null;
  location: string;
  address: string | null;
  curator_name: string | null;
  curator_bio: string | null;
  curator_image: string | null;
  type: 'exhibition' | 'event' | 'workshop';
  status: 'upcoming' | 'ongoing' | 'past';
  is_featured: boolean;
  is_active: boolean;
  gallery_images: string[] | null;
  visiting_hours: Record<string, string> | null;
  ticket_info: Record<string, any> | null;
  contact_info: Record<string, string> | null;
  highlights: string[] | null;
  artworks_count?: number;
  artists_count?: number;
  artworks?: ExhibitionArtwork[];
  artists?: ExhibitionArtist[];
  formatted_dates?: {
    start: string;
    end: string | null;
  };
  created_at: string;
  updated_at: string;
}

class ExhibitionService {
  async getAll(params?: {
    status?: string;
    type?: string;
    is_featured?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Exhibition>> {
    const response = await api.get<PaginatedResponse<Exhibition>>('/admin/exhibitions', { params });
    return response.data;
  }

  async getAllArtworks(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<ExhibitionArtwork>> {
    const response = await api.get<PaginatedResponse<ExhibitionArtwork>>('/admin/artworks', {
      params,
    });
    return response.data;
  }

  async getById(id: number): Promise<Exhibition> {
    const response = await api.get<ApiResponse<Exhibition>>(`/admin/exhibitions/${id}`);
    return response.data.data;
  }

  async create(data: FormData): Promise<Exhibition> {
    const response = await api.post<ApiResponse<Exhibition>>('/admin/exhibitions', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async update(id: number, data: FormData): Promise<Exhibition> {
    const response = await api.post<ApiResponse<Exhibition>>(`/admin/exhibitions/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/exhibitions/${id}`);
  }

  // Artwork management
  async getAvailableArtworks(
    exhibitionId: number,
    params?: {
      search?: string;
      artist_id?: number;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedResponse<ExhibitionArtwork>> {
    const response = await api.get<PaginatedResponse<ExhibitionArtwork>>(
      `/admin/exhibitions/${exhibitionId}/available-artworks`,
      { params }
    );
    return response.data;
  }

  async addArtworks(
    exhibitionId: number,
    artworks: Array<{
      artwork_id: number;
      display_order?: number;
      is_featured?: boolean;
      notes?: string;
    }>
  ): Promise<Exhibition> {
    const response = await api.post<ApiResponse<Exhibition>>(
      `/admin/exhibitions/${exhibitionId}/artworks`,
      { artworks }
    );
    return response.data.data;
  }

  async removeArtwork(exhibitionId: number, artworkId: number): Promise<Exhibition> {
    const response = await api.delete<ApiResponse<Exhibition>>(
      `/admin/exhibitions/${exhibitionId}/artworks/${artworkId}`
    );
    return response.data.data;
  }

  async reorderArtworks(
    exhibitionId: number,
    artworks: Array<{ artwork_id: number; display_order: number }>
  ): Promise<Exhibition> {
    const response = await api.put<ApiResponse<Exhibition>>(
      `/admin/exhibitions/${exhibitionId}/artworks/reorder`,
      { artworks }
    );
    return response.data.data;
  }

  async updateArtwork(
    exhibitionId: number,
    artworkId: number,
    data: { is_featured?: boolean; notes?: string; display_order?: number }
  ): Promise<Exhibition> {
    const response = await api.put<ApiResponse<Exhibition>>(
      `/admin/exhibitions/${exhibitionId}/artworks/${artworkId}`,
      data
    );
    return response.data.data;
  }

  async deleteGalleryImage(exhibitionId: number, imageUrl: string): Promise<Exhibition> {
    const response = await api.delete<ApiResponse<Exhibition>>(
      `/admin/exhibitions/${exhibitionId}/gallery-image`,
      { data: { image_url: imageUrl } }
    );
    return response.data.data;
  }
}

export const exhibitionService = new ExhibitionService();
export default exhibitionService;
