import type { EwsLevel, ZoneLevel, UrgencyLevel, ViolationCategory } from './types';

// Palet minimal: hanya merah (kritis) & kuning (tinggi) yang berwarna; sisanya netral mengikuti tema.
// Kelas Tailwind ditulis lengkap agar terdeteksi saat build.
const NEUTRAL = 'border-line text-fg-muted';
const WARN = 'border-warn/60 bg-warn/10 text-fg';
const DANGER = 'border-danger/40 bg-danger/10 text-danger';

export const URGENCY_STYLE: Record<UrgencyLevel, { label: string; badge: string; bar: string }> = {
  critical: { label: 'Kritis', badge: DANGER, bar: 'bg-danger' },
  high: { label: 'Tinggi', badge: WARN, bar: 'bg-warn' },
  medium: { label: 'Sedang', badge: NEUTRAL, bar: 'bg-fg-muted' },
  low: { label: 'Rendah', badge: NEUTRAL, bar: 'bg-line' },
};

export const EWS_STYLE: Record<EwsLevel, { label: string; badge: string; border: string }> = {
  awas: { label: 'AWAS', badge: 'border-danger bg-danger text-white', border: 'border-danger/50' },
  siaga: { label: 'SIAGA', badge: DANGER, border: 'border-danger/30' },
  waspada: { label: 'WASPADA', badge: WARN, border: 'border-warn/40' },
  normal: { label: 'NORMAL', badge: NEUTRAL, border: 'border-line' },
};

export const ZONE_STYLE: Record<ZoneLevel, { label: string; badge: string }> = {
  merah: { label: 'Zona Merah', badge: DANGER },
  oranye: { label: 'Zona Oranye', badge: WARN },
  kuning: { label: 'Zona Kuning', badge: NEUTRAL },
  hijau: { label: 'Zona Hijau', badge: NEUTRAL },
};

export const CATEGORY_LABEL: Record<ViolationCategory, string> = {
  tindak_pidana: 'Tindak Pidana',
  pelanggaran_etik: 'Pelanggaran Etik',
  pelanggaran_disiplin: 'Pelanggaran Disiplin',
  netralitas: 'Netralitas',
};

export const PLATFORM_OPTIONS = [
  { value: '', label: 'Semua platform' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'web', label: 'Portal berita' },
];

export const URGENCY_LEVELS: UrgencyLevel[] = ['critical', 'high', 'medium', 'low'];
