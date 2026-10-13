import api from './api';

export interface ReportSettingsInput {
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
  email_enabled: boolean;
  email_source: 'account' | 'custom';
  custom_email: string | null;
}

export interface ReportSettings extends ReportSettingsInput {
  account_email: string | null;
  resolved_email: string | null;
  delivery_available: boolean;
  schedule_time?: string;
}

const PATH = '/v1/propam/report-settings';

export interface ReportPreview {
  report: {
    type: 'alert' | 'routine';
    generated_at: string;
    target_unit: string | null;
    urgency: string[];
    summary: {
      detected_posts: number;
      viral_posts: number;
      negative_posts: number;
      total_posts: number;
      negative_pct: number | null;
      platforms: string[];
    };
    main_issue: string | null;
    recommendations: string[];
  };
  whatsapp_text: string;
}

export const reportPreviewService = {
  async get(signal?: AbortSignal) {
    const { data } = await api.get<{ data: ReportPreview; meta?: Record<string, unknown>; generated_at: string }>(
      '/v1/propam/report/preview',
      { signal }
    );
    return { ...data, meta: data.meta ?? {} };
  },
};

export const reportSettingsService = {
  async get(signal?: AbortSignal) {
    const { data } = await api.get<{ data: ReportSettings }>(PATH, { signal });
    return data.data;
  },
  async save(input: ReportSettingsInput) {
    const { data } = await api.put<{ data: ReportSettings; message: string }>(PATH, input);
    return data;
  },
};
