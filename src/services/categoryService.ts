import api from './api';

// Artwork Category
export interface ArtworkCategory {
  id: number;
  name: string;
  slug: string;
  artists_count?: number;
  created_at: string;
  updated_at: string;
}

// Medium
export interface Medium {
  id: number;
  name: string;
  slug: string;
  artworks_count?: number;
  created_at: string;
  updated_at: string;
}

// Gallery Category
export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  galleries_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryStatistics {
  artwork_categories: number;
  mediums: number;
  gallery_categories: number;
}

export const categoryService = {
  // Get statistics
  async getStatistics(): Promise<CategoryStatistics> {
    const response = await api.get('/admin/categories/statistics');
    return response.data.data;
  },

  // ==================== ARTWORK CATEGORIES ====================
  async getArtworkCategories(search?: string): Promise<ArtworkCategory[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/admin/categories/artwork${params}`);
    return response.data.data;
  },

  async createArtworkCategory(name: string): Promise<ArtworkCategory> {
    const response = await api.post('/admin/categories/artwork', { name });
    return response.data.data;
  },

  async updateArtworkCategory(id: number, name: string): Promise<ArtworkCategory> {
    const response = await api.put(`/admin/categories/artwork/${id}`, { name });
    return response.data.data;
  },

  async deleteArtworkCategory(id: number) {
    const response = await api.delete(`/admin/categories/artwork/${id}`);
    return response.data;
  },

  // ==================== MEDIUMS ====================
  async getMediums(search?: string): Promise<Medium[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/admin/categories/mediums${params}`);
    return response.data.data;
  },

  async createMedium(name: string): Promise<Medium> {
    const response = await api.post('/admin/categories/mediums', { name });
    return response.data.data;
  },

  async updateMedium(id: number, name: string): Promise<Medium> {
    const response = await api.put(`/admin/categories/mediums/${id}`, { name });
    return response.data.data;
  },

  async deleteMedium(id: number) {
    const response = await api.delete(`/admin/categories/mediums/${id}`);
    return response.data;
  },

  // ==================== GALLERY CATEGORIES ====================
  async getGalleryCategories(search?: string): Promise<GalleryCategory[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/admin/categories/gallery${params}`);
    return response.data.data;
  },

  async createGalleryCategory(data: {
    name: string;
    description?: string;
  }): Promise<GalleryCategory> {
    const response = await api.post('/admin/categories/gallery', data);
    return response.data.data;
  },

  async updateGalleryCategory(
    id: number,
    data: { name: string; description?: string }
  ): Promise<GalleryCategory> {
    const response = await api.put(`/admin/categories/gallery/${id}`, data);
    return response.data.data;
  },

  async deleteGalleryCategory(id: number) {
    const response = await api.delete(`/admin/categories/gallery/${id}`);
    return response.data;
  },
};
