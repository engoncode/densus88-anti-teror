// src/services/galleryService.ts
import api from './api';

import type { ApiResponse, PaginatedResponse } from '../types/common';

export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  galleries_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: number;
  gallery_id: number;
  path: string;
  image_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Gallery {
  id: number;
  title: string;
  slug: string;
  description: string;
  category_id: number;
  category?: GalleryCategory;
  date: string;
  location: string;
  image: string;
  images?: GalleryImage[];
  created_at: string;
  updated_at: string;
}

class GalleryService {
  async getAll(params?: {
    category_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Gallery>> {
    const response = await api.get<PaginatedResponse<Gallery>>('/admin/galleries', { params });
    return response.data;
  }

  async getById(id: number): Promise<Gallery> {
    const response = await api.get<ApiResponse<Gallery>>(`/admin/galleries/${id}`);
    return response.data.data;
  }

  async create(data: FormData): Promise<Gallery> {
    const response = await api.post<ApiResponse<Gallery>>('/admin/galleries', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async update(id: number, data: FormData): Promise<Gallery> {
    const response = await api.post<ApiResponse<Gallery>>(`/admin/galleries/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/galleries/${id}`);
  }

  // Gallery Images methods
  async addImages(galleryId: number, images: File[]): Promise<GalleryImage[]> {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images[]', image);
    });
    const response = await api.post<ApiResponse<GalleryImage[]>>(
      `/admin/galleries/${galleryId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  }

  async updateImage(
    galleryId: number,
    imageId: number,
    data: { caption?: string; sort_order?: number }
  ): Promise<GalleryImage> {
    const response = await api.put<ApiResponse<GalleryImage>>(
      `/admin/galleries/${galleryId}/images/${imageId}`,
      data
    );
    return response.data.data;
  }

  async deleteImage(galleryId: number, imageId: number): Promise<void> {
    await api.delete(`/admin/galleries/${galleryId}/images/${imageId}`);
  }

  async reorderImages(
    galleryId: number,
    images: Array<{ id: number; sort_order: number }>
  ): Promise<Gallery> {
    const response = await api.put<ApiResponse<Gallery>>(
      `/admin/galleries/${galleryId}/images/reorder`,
      { images }
    );
    return response.data.data;
  }

  // Category methods
  async getCategories(): Promise<GalleryCategory[]> {
    const response = await api.get<ApiResponse<GalleryCategory[]>>('/admin/galleries/categories');
    return response.data.data;
  }

  async createCategory(data: { name: string; icon?: string }): Promise<GalleryCategory> {
    const response = await api.post<ApiResponse<GalleryCategory>>(
      '/admin/galleries/categories',
      data
    );
    return response.data.data;
  }

  async updateCategory(
    id: number,
    data: { name?: string; icon?: string }
  ): Promise<GalleryCategory> {
    const response = await api.put<ApiResponse<GalleryCategory>>(
      `/admin/galleries/categories/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/admin/galleries/categories/${id}`);
  }
}

export const galleryService = new GalleryService();
export default galleryService;
