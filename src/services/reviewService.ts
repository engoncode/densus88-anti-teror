import api from './api';

export interface Review {
  id: number;
  user_id: number;
  artwork_id: number;
  order_id: number | null;
  rating: number;
  comment: string | null;
  quality_rating: number | null;
  packaging_rating: number | null;
  shipping_rating: number | null;
  communication_rating: number | null;
  photos: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  artist_response: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  };
  artwork?: {
    id: number;
    title: string;
    slug: string;
    images?: string[];
  };
  order?: {
    id: number;
    order_number: string;
    total_amount: number;
  };
}

export interface ReviewStatistics {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
}

export interface ReviewFilters {
  search?: string;
  status?: string;
  rating?: number;
  artwork_id?: number;
  page?: number;
  per_page?: number;
}

export const reviewService = {
  // Get all reviews with filters
  async getReviews(filters: ReviewFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/reviews?${params.toString()}`);
    return response.data;
  },

  // Get review statistics
  async getStatistics(): Promise<ReviewStatistics> {
    const response = await api.get('/admin/reviews/statistics');
    return response.data.data;
  },

  // Get single review
  async getReview(id: number): Promise<Review> {
    const response = await api.get(`/admin/reviews/${id}`);
    return response.data.data;
  },

  // Approve review
  async approveReview(id: number) {
    const response = await api.post(`/admin/reviews/${id}/approve`);
    return response.data;
  },

  // Reject review
  async rejectReview(id: number, reason?: string) {
    const response = await api.post(`/admin/reviews/${id}/reject`, { reason });
    return response.data;
  },

  // Delete review
  async deleteReview(id: number) {
    const response = await api.delete(`/admin/reviews/${id}`);
    return response.data;
  },

  // Bulk approve
  async bulkApprove(ids: number[]) {
    const response = await api.post('/admin/reviews/bulk-approve', { ids });
    return response.data;
  },

  // Bulk reject
  async bulkReject(ids: number[], reason?: string) {
    const response = await api.post('/admin/reviews/bulk-reject', { ids, reason });
    return response.data;
  },
};
