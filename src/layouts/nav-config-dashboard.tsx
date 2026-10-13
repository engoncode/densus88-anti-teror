import { Icon } from '@iconify/react';
import { BookOpen, ShieldCheck } from 'lucide-react';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const icon = (name: string) => <Icon icon={name} width={18} />;

export type NavItem = {
  title: string;
  caption?: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
  roles?: string[]; // Optional: restrict to specific roles
};

export type NavGroup = {
  subheader: string;
  items: NavItem[];
  roles?: string[]; // Optional: restrict entire group to specific roles
};

export const navData: NavGroup[] = [
  {
    subheader: 'Ikhtisar',
    items: [
      {
        title: 'Dashboard Intelijen',
        path: '/',
        icon: icon('solar:home-2-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Densus 88 — EWS Kontraterorisme',
    items: [
      {
        title: 'Radar Ancaman Teror',
        caption: 'Deteksi eskalasi narasi ekstremisme digital',
        path: '/densus88/radar',
        icon: icon('tabler:radar'),
      },
      {
        title: 'Sentimen & Propaganda Publik',
        caption: 'Pantau reaksi publik dan kontra-narasi',
        path: '/densus88/dumas',
        icon: icon('solar:chat-round-dots-bold-duotone'),
      },
      {
        title: 'Kategorisasi Sel & Modus Operandi',
        caption: 'Propaganda, rekrutmen, pendanaan, persiapan aksi',
        path: '/densus88/kategorisasi',
        icon: icon('solar:tag-bold-duotone'),
      },
      {
        title: 'EWS Kontraterorisme',
        caption: 'Peringatan dini potensi eskalasi ancaman',
        path: '/densus88/ews',
        icon: icon('solar:bell-bing-bold-duotone'),
      },
      {
        title: 'Peta Rawan Radikalisme',
        caption: 'Pemetaan indikasi wilayah dan persebaran narasi',
        path: '/densus88/red-zone',
        icon: icon('solar:map-point-bold-duotone'),
      },
      {
        title: 'Ringkasan & Mitigasi',
        caption: 'Rekomendasi preventif dan kontra-narasi',
        path: '/densus88/ringkasan',
        icon: icon('solar:document-text-bold-duotone'),
      },
      {
        title: 'SNA & Network Mapping',
        caption: 'Pemetaan simpul komunikasi dan persebaran narasi',
        path: '/densus88/sna',
        icon: icon('solar:graph-bold-duotone'),
      },
      {
        title: 'Isu & Bukti Digital',
        caption: 'Timeline narasi dan sumber indikasi OSINT',
        path: '/densus88/issues',
        icon: icon('solar:document-text-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Analisis Intelijen',
    items: [
      {
        title: 'Referensi & Sumber',
        caption: 'Temuan dan kutipan dari sumber terbuka',
        path: '/mentions',
        icon: icon('solar:mention-square-bold-duotone'),
      },
      {
        title: 'Indikator & Metrik',
        caption: 'Grafik dan statistik pemantauan',
        path: '/analytics',
        icon: icon('solar:chart-bold-duotone'),
      },
      {
        title: 'Tren Narasi',
        caption: 'Narasi yang sedang berkembang',
        path: '/trending',
        icon: icon('solar:fire-bold-duotone'),
      },
      {
        title: 'Analisis Kata Kunci',
        caption: 'Pantau kata kunci pada topik terpilih',
        path: '/keywords',
        icon: icon('solar:hashtag-bold-duotone'),
      },
      {
        title: 'Ringkasan Wawasan AI',
        caption: 'Ikhtisar analisis dan indikator',
        path: '/ai-insights',
        icon: icon('tabler:radar'),
      },
      {
        title: 'Peta Jaringan Sosial',
        caption: 'Analisis jejaring sosial dan relasi akun',
        path: '/sna',
        icon: icon('solar:graph-bold-duotone'),
      },
      {
        title: 'Analisis Wilayah',
        caption: 'Sebaran dan sentimen per wilayah',
        path: '/city-analysis',
        icon: icon('solar:map-point-bold-duotone'),
      },
      {
        title: 'Pemetaan Hubungan',
        caption: 'Koneksi dan interaksi antar akun',
        path: '/connection',
        icon: icon('solar:users-group-two-rounded-bold-duotone'),
      },
      {
        title: 'Alur Persebaran',
        caption: 'Jalur penyebaran narasi digital',
        path: '/viral-path',
        icon: icon('solar:graph-up-bold-duotone'),
      },
      {
        title: 'Konten Viral',
        caption: 'Konten dengan jangkauan dan interaksi tinggi',
        path: '/viral-posts',
        icon: icon('solar:fire-minimalistic-bold-duotone'),
      },
      {
        title: 'Akun Berpengaruh',
        caption: 'Key Opinion Leaders dan influencer',
        path: '/influencer',
        icon: icon('solar:crown-star-bold-duotone'),
      },
      {
        title: 'Deteksi Risiko',
        caption: 'Konten provokatif dan indikasi disinformasi',
        path: '/detection',
        icon: icon('solar:shield-warning-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Pengelolaan Data',
    items: [
      {
        title: 'Pengaturan Topik',
        path: '/topics-settings',
        icon: icon('solar:settings-bold-duotone'),
      },
      {
        title: 'Perbandingan',
        path: '/compare',
        icon: icon('solar:chart-2-bold-duotone'),
      },
      {
        title: 'Ekspor Data',
        path: '/export',
        icon: icon('solar:download-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Akun',
    items: [
      {
        title: 'Profil',
        path: '/profile',
        icon: icon('solar:user-bold-duotone'),
      },
      {
        title: 'Pengaturan Laporan',
        caption: 'Preferensi kanal laporan',
        path: '/densus88/report-settings',
        icon: icon('solar:settings-bold-duotone'),
      },
      {
        title: 'Pengaturan Akses Wilayah',
        caption: 'Atur cakupan Polda untuk pengguna',
        path: '/densus88/access-settings',
        icon: <ShieldCheck size={18} aria-hidden="true" />,
        roles: ['Operator'],
      },
      {
        title: 'Log Aktivitas',
        path: '/activity-logs',
        icon: icon('solar:history-2-bold-duotone'),
      },
      {
        title: 'Panduan Penggunaan',
        caption: 'Cara pakai seluruh halaman web',
        path: '/panduan',
        icon: <BookOpen size={18} aria-hidden="true" />,
      },
    ],
  },
  {
    subheader: 'Manajemen',
    roles: ['Operator'],
    items: [
      {
        title: 'Buat User',
        caption: 'Tambah user Operator atau Viewer',
        path: '/create-user',
        icon: icon('solar:user-plus-bold-duotone'),
        roles: ['Operator'],
      },
    ],
  },
];

// Filter nav data based on user role
export function getFilteredNavData(userRole?: string): NavGroup[] {
  if (!userRole) return navData;

  return navData
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);
}
