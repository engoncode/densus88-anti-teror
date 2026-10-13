import api from './api';

export interface ActivityLog {
  id: number;
  user_id: number | null;
  username: string;
  action: string;
  target_id: number | null;
  target_type: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  tanggal_action: string;
  user?: {
    id: number;
    name: string;
    username: string;
    workspace_id: number;
  };
}

export interface ActivityLogStatistics {
  total_activities: number;
  by_action: Record<string, number>;
  by_day: Record<string, number>;
  most_active_admins: Array<{
    user_id: number;
    count: number;
    user?: {
      id: number;
      name: string;
      avatar: string | null;
    };
  }>;
}

export interface ActivityLogFilters {
  search?: string;
  action?: string;
  user_id?: number;
  subject_type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export const activityLogService = {
  // Get all activity logs
  async getActivityLogs(filters: ActivityLogFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/activity-logs?${params.toString()}`);
    return response.data;
  },

  // Get statistics
  async getStatistics(startDate?: string, endDate?: string): Promise<ActivityLogStatistics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`/admin/activity-logs/statistics?${params.toString()}`);
    return response.data.data;
  },

  // Get available actions
  async getActions(): Promise<string[]> {
    const response = await api.get('/admin/activity-logs/actions');
    return response.data.data;
  },

  // Get subject types
  async getSubjectTypes(): Promise<Array<{ value: string; label: string }>> {
    const response = await api.get('/admin/activity-logs/subject-types');
    return response.data.data;
  },

  // Get single log
  async getLog(id: number): Promise<ActivityLog> {
    const response = await api.get(`/admin/activity-logs/${id}`);
    return response.data.data;
  },

  // Cleanup old logs
  async cleanup(days: number) {
    const response = await api.post('/admin/activity-logs/cleanup', { days });
    return response.data;
  },
};
