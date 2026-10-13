import apiClient from './apiService';

export interface Topic {
  id: number;
  name: string;
  keyword: string;
  hashtag: string;
  instansi: string;
  workspace_id: number;
  created_by: number;
  monitoring: 'Y' | 'N';
  instagram: 'Y' | 'N';
  twitter: 'Y' | 'N';
  threads: 'Y' | 'N';
  facebook: 'Y' | 'N';
  tiktok: 'Y' | 'N';
  youtube: 'Y' | 'N';
  media: 'Y' | 'N';
  shadow: 'Y' | 'N';
  instagram_interval?: number;
  twitter_interval?: number;
  facebook_interval?: number;
  tiktok_interval?: number;
  youtube_interval?: number;
  custom_prompt?: string;
  context?: string;
  created_at: string;
  updated_at: string;
  last_processed_at: string | null;
  workspace?: {
    id: number;
    name: string;
  };
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTopicData {
  name: string;
  keyword: string;
  hashtag?: string;
  instansi?: string;
  workspace_id?: number;
  monitoring?: 'Y' | 'N';
  instagram?: 'Y' | 'N';
  twitter?: 'Y' | 'N';
  facebook?: 'Y' | 'N';
  tiktok?: 'Y' | 'N';
  youtube?: 'Y' | 'N';
  instagram_interval?: number;
  twitter_interval?: number;
  facebook_interval?: number;
  tiktok_interval?: number;
  youtube_interval?: number;
  custom_prompt?: string;
  context?: string;
}

export interface UpdateTopicData {
  name?: string;
  keyword?: string;
  hashtag?: string;
  instansi?: string;
  monitoring?: 'Y' | 'N';
  instagram?: 'Y' | 'N';
  twitter?: 'Y' | 'N';
  facebook?: 'Y' | 'N';
  tiktok?: 'Y' | 'N';
  youtube?: 'Y' | 'N';
  instagram_interval?: number;
  twitter_interval?: number;
  facebook_interval?: number;
  tiktok_interval?: number;
  youtube_interval?: number;
  custom_prompt?: string;
  context?: string;
}

export type ThreatMonitoringSource = 'media' | 'twitter' | 'facebook' | 'instagram' | 'tiktok';

export interface CreateThreatMonitoringTopicData {
  name: string;
  keyword: string;
  workspace_id: number;
  hashtag?: string;
  instansi?: string;
  monitoring: boolean;
  media_sources: ThreatMonitoringSource[];
  context?: string;
}

export const topicsApi = {
  // Get topics (filtered by user's workspace access)
  getAll: () => apiClient.get<Topic[]>('/topics'),

  // Super Admin: Get all topics across workspaces
  getAllTopics: () => apiClient.get<Topic[]>('/admin/topics/all'),

  getById: (id: number) => apiClient.get<Topic>(`/topics/${id}`),

  create: (data: CreateTopicData) => apiClient.post<Topic>('/topics', data),

  createThreatMonitoring: (data: CreateThreatMonitoringTopicData) =>
    apiClient.post<{ message: string; topic: Topic }>('/v1/densus88/threat-monitoring/topics', data),

  update: (id: number, data: UpdateTopicData) => apiClient.put<Topic>(`/topics/${id}`, data),

  delete: (id: number) => apiClient.delete(`/topics/${id}`),

  // Execute topic for social search
  execute: (id: number) => apiClient.post(`/topics/execute`, { topic_id: id }),

  // Generate context for topic using AI
  generateContext: (name: string, instansi?: string) =>
    apiClient.post<{ context: string }>('/topics/generate-context', { name, instansi }),
};

export default topicsApi;
