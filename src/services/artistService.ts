// src/services/artistService.ts
import api from './api';

import type { ApiResponse, PaginatedResponse } from '../types/common';
import type {
  ArtistProfile,
  CreateManualArtistData,
  CreateArtistWithUserData,
  UpdateArtistData,
  VerifyDirectData,
  VerifyLinkData,
} from '../types/artist';

class ArtistService {
  async getPendingVerifications(): Promise<ArtistProfile[]> {
    const response = await api.get<ApiResponse<ArtistProfile[]>>('/admin/artists/pending');
    return response.data.data;
  }

  async getAll(params?: {
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<ArtistProfile>> {
    const response = await api.get<PaginatedResponse<ArtistProfile>>('/admin/artists', { params });
    return response.data;
  }

  async getById(id: number): Promise<ArtistProfile> {
    const response = await api.get<ApiResponse<ArtistProfile>>(`/admin/artists/${id}`);
    return response.data.data;
  }

  async verifyDirect(userId: number, data: VerifyDirectData): Promise<ArtistProfile> {
    const response = await api.post<ApiResponse<ArtistProfile>>(
      `/admin/artists/verify-direct/${userId}`,
      data
    );
    return response.data.data;
  }

  async verifyAndLink(data: VerifyLinkData): Promise<ArtistProfile> {
    const response = await api.post<ApiResponse<ArtistProfile>>('/admin/artists/verify-link', data);
    return response.data.data;
  }

  async createManual(data: CreateManualArtistData): Promise<ArtistProfile> {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.post<ApiResponse<ArtistProfile>>(
      '/admin/artists/create-manual',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  }

  async createWithUser(data: CreateArtistWithUserData): Promise<ArtistProfile> {
    const response = await api.post<ApiResponse<ArtistProfile>>(
      '/admin/artists/create-with-user',
      data
    );
    return response.data.data;
  }

  async update(id: number, data: UpdateArtistData): Promise<ArtistProfile> {
    const response = await api.put<ApiResponse<ArtistProfile>>(`/admin/artists/${id}`, data);
    return response.data.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/artists/${id}`);
  }

  async searchManualArtists(name: string): Promise<ArtistProfile[]> {
    const response = await api.get<ApiResponse<ArtistProfile[]>>('/admin/artists/search', {
      params: { name },
    });
    return response.data.data;
  }
}

export const artistService = new ArtistService();
export default artistService;
