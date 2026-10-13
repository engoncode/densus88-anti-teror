export type UrgencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type EwsLevel = 'normal' | 'waspada' | 'siaga' | 'awas';
export type ZoneLevel = 'hijau' | 'kuning' | 'oranye' | 'merah';

export type ViolationCategory =
  | 'tindak_pidana'
  | 'pelanggaran_etik'
  | 'pelanggaran_disiplin'
  | 'netralitas';

export interface PropamEnvelope<TData, TMeta = Record<string, unknown>> {
  data: TData;
  meta: TMeta;
  generated_at: string;
}

export interface PropamPost {
  id: number;
  topic_id: number;
  platform: string | null;
  post_id: string | null;
  url: string | null;
  author: { id: string | null; username: string | null; url: string | null };
  text: string;
  posted_at: string;
  engagement: number;
  reach: number;
  viral_score: number;
  is_viral: boolean;
  keywords: string[];
  categories: ViolationCategory[];
  primary_category: ViolationCategory | null;
  category_label: string | null;
  urgency: { score: number; level: UrgencyLevel };
  satwil: string | null;
  satker: string | null;
  unit: string | null;
  velocity_per_hour?: number;
}

export interface Paginated<T> {
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export type UrgencyCounts = Record<UrgencyLevel, number>;

export interface RadarData {
  summary: { total: number; viral: number; by_urgency: UrgencyCounts };
  items: Paginated<PropamPost>;
}
export interface RadarMeta {
  window_hours: number;
  refresh_seconds: number;
  viral_threshold: number;
}

export interface DumasData {
  summary: { total: number; by_urgency: UrgencyCounts; by_platform: Record<string, number> };
  items: Paginated<PropamPost>;
}

export interface CategoryStat {
  category: ViolationCategory;
  label: string;
  count: number;
  percentage: number;
  critical: number;
}
export interface KategorisasiData {
  total: number;
  multi_category: number;
  categories: CategoryStat[];
  items: Paginated<PropamPost>;
}

export interface EwsUnit {
  unit: string;
  satwil: string | null;
  satker: string | null;
  level: EwsLevel;
  current_count: number;
  baseline_daily_mean: number;
  z_score: number;
  spike_ratio: number;
  critical_posts: number;
  engagement: number;
  top_category: ViolationCategory | null;
  top_keywords: { keyword: string; count: number }[];
  baseline_series: number[];
  sample_posts: PropamPost[];
}
export interface EwsData {
  summary: { units_monitored: number; alerts: number; by_level: Partial<Record<EwsLevel, number>> };
  units: EwsUnit[];
}

export interface RedZone {
  label: string;
  lat: number;
  lon: number;
  negative_count: number;
  violation_count: number;
  critical_count: number;
  engagement: number;
  top_category: ViolationCategory | null;
  top_keywords: string[];
  zone: ZoneLevel;
}
export interface RedZoneData {
  summary: Partial<Record<ZoneLevel, number>>;
  zones: RedZone[];
}

export interface Kol {
  username: string | null;
  url: string | null;
  platform: string | null;
  posts: number;
  engagement: number;
  reach: number;
  first_post_lag_minutes: number;
}
export interface SnaCluster {
  unit: string;
  total_posts: number;
  total_engagement: number;
  ground_zero: PropamPost;
  kols: Kol[];
  platforms: Record<string, number>;
  timeline: { hour: string; posts: number; engagement: number }[];
}
export interface SnaData {
  clusters: SnaCluster[];
}

export interface Recommendation {
  priority: EwsLevel;
  target: string;
  category: ViolationCategory | null;
  rationale: string;
  actions: string[];
  sla: string;
  reference_url?: string | null;
}
export type EwsAlert = Omit<EwsUnit, 'sample_posts' | 'baseline_series'>;
export interface RingkasanData {
  overview: {
    negative_posts: number;
    violation_posts: number;
    violation_ratio_pct: number;
    by_urgency: UrgencyCounts;
    by_category: Partial<Record<ViolationCategory, number>>;
  };
  ews_alerts: EwsAlert[];
  top_viral: PropamPost[];
  red_zones: RedZone[];
  ground_zero: { unit: string; ground_zero: PropamPost; kols: Kol[] }[];
  recommendations: Recommendation[];
}

export interface PropamQuery {
  topic_id?: number;
  from?: string;
  to?: string;
  hours?: number;
  platform?: string;
  urgency?: string;
  category?: ViolationCategory;
  unit?: string;
  limit?: number;
  page?: number;
}

export interface PropamIssue {
  id: string;
  title: string;
  topic_id: number;
  unit_mentioned: string | null;
  category: ViolationCategory | null;
  urgency: { score: number; level: UrgencyLevel };
  verification_status: 'unverified';
  post_count: number;
  unique_sources: number;
  platforms: Record<string, number>;
  first_observed_post_at: string;
  latest_observed_post_at: string;
  timeline: { hour: string; posts: number }[];
}

export interface IssuesData {
  summary: { issues: number; posts: number };
  items: Paginated<PropamIssue>;
}

export interface IssueDetailData {
  issue: PropamIssue;
  sources: Paginated<PropamPost & { collected_at: string | null }>;
}

export interface IssuesMeta {
  from: string;
  to: string;
  truncated: boolean;
  max_rows: number;
  method: string;
  similarity_threshold: number;
  max_cluster_hours: number;
}
