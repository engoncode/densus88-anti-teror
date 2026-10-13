import api from './api';

export interface DashboardOverview {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  users: {
    current: number;
    previous: number;
    growth: number;
    total: number;
  };
  artworks: {
    current: number;
    previous: number;
    growth: number;
    total: number;
  };
}

export interface SalesChartData {
  period: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
}

export interface SalesReport {
  chart_data: SalesChartData[];
  summary: {
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
  };
}

export interface TopArtwork {
  id: number;
  title: string;
  images: string | null;
  artist_name: string | null;
  total_sold: number;
  total_revenue: number;
}

export interface TopArtist {
  id: number;
  name: string;
  avatar: string | null;
  total_orders: number;
  total_sold: number;
  total_revenue: number;
}

export interface UserReport {
  registrations: Record<string, number>;
  by_role: Record<string, number>;
  active_users: number;
  total_users: number;
}

export interface WithdrawalReport {
  by_status: Record<string, { count: number; total_amount: number }>;
  by_day: Record<string, number>;
  pending_amount: number;
  total_withdrawn: number;
}

export interface ReportFilters {
  period?: 'day' | 'week' | 'month' | 'year';
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
  limit?: number;
}

export const reportService = {
  // Get dashboard overview
  async getDashboardOverview(period: string = 'month'): Promise<DashboardOverview> {
    const response = await api.get(`/admin/reports/dashboard?period=${period}`);
    return response.data.data;
  },

  // Get sales report
  async getSalesReport(filters: ReportFilters = {}): Promise<SalesReport> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/reports/sales?${params.toString()}`);
    return response.data.data;
  },

  // Get top artworks
  async getTopArtworks(filters: ReportFilters = {}): Promise<TopArtwork[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/reports/top-artworks?${params.toString()}`);
    return response.data.data;
  },

  // Get top artists
  async getTopArtists(filters: ReportFilters = {}): Promise<TopArtist[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/reports/top-artists?${params.toString()}`);
    return response.data.data;
  },

  // Get user report
  async getUserReport(filters: ReportFilters = {}): Promise<UserReport> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/reports/users?${params.toString()}`);
    return response.data.data;
  },

  // Get withdrawal report
  async getWithdrawalReport(filters: ReportFilters = {}): Promise<WithdrawalReport> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const response = await api.get(`/admin/reports/withdrawals?${params.toString()}`);
    return response.data.data;
  },

  // Export sales to CSV
  async exportSales(startDate: string, endDate: string) {
    const response = await api.get(
      `/admin/reports/export/sales?start_date=${startDate}&end_date=${endDate}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
