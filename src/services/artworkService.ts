// src/services/artworkService.ts
import api from './api';

import type { ApiResponse, PaginatedResponse } from '../types/common';
import type { Artwork, CreateArtworkData, ArtworkImage, Category, Medium } from '../types/artwork';

class ArtworkService {
  async getAll(params?: {
    vendor_type?: 'artist' | 'lapalapa';
    search?: string;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<Artwork>> {
    const response = await api.get<PaginatedResponse<Artwork>>('/admin/artworks', { params });
    return response.data;
  }

  async create(data: CreateArtworkData): Promise<Artwork> {
    const formData = new FormData();

    // Append basic fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'main_image' && value instanceof File) {
          formData.append('main_image', value);
        } else if (key === 'additional_images' && Array.isArray(value)) {
          value.forEach((file) => {
            if (file instanceof File) {
              formData.append('additional_images[]', file);
            }
          });
        } else if (!(value instanceof File)) {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post<ApiResponse<Artwork>>('/admin/artworks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async update(id: number, data: Partial<CreateArtworkData>): Promise<Artwork> {
    const response = await api.put<ApiResponse<Artwork>>(`/admin/artworks/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/artworks/${id}`);
  }

  async uploadImage(artworkId: number, image: File, isMain?: boolean): Promise<ArtworkImage> {
    const formData = new FormData();
    formData.append('image', image);
    if (isMain !== undefined) {
      formData.append('is_main', isMain ? '1' : '0');
    }

    const response = await api.post<ApiResponse<ArtworkImage>>(
      `/admin/artworks/${artworkId}/images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  }

  async deleteImage(artworkId: number, imageId: number): Promise<void> {
    await api.delete(`/admin/artworks/${artworkId}/images/${imageId}`);
  }

  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  }

  async getMediums(): Promise<Medium[]> {
    const response = await api.get<ApiResponse<Medium[]>>('/mediums');
    return response.data.data;
  }
}

export const artworkService = new ArtworkService();
export default artworkService;
