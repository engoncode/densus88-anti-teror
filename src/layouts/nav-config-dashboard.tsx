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
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: '/',
        icon: icon('solar:home-2-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Propam — EWS Paminal',
    items: [
      {
        title: 'Radar Oknum Viral',
        caption: 'Deteksi real-time konten indisipliner',
        path: '/propam/radar',
        icon: icon('tabler:radar'),
      },
      {
        title: 'Dumas',
        caption: 'Sentimen pengaduan masyarakat',
        path: '/propam/dumas',
        icon: icon('solar:chat-round-dots-bold-duotone'),
      },
      {
        title: 'Kategorisasi Pelanggaran',
        caption: 'Etik, disiplin, netralitas, pidana',
        path: '/propam/kategorisasi',
        icon: icon('solar:tag-bold-duotone'),
      },
      {
        title: 'EWS Paminal',
        caption: 'Peringatan dini per Satwil/Satker',
        path: '/propam/ews',
        icon: icon('solar:bell-bing-bold-duotone'),
      },
      {
        title: 'Peta Rawan Isu',
        caption: 'Red zone sentimen negatif',
        path: '/propam/red-zone',
        icon: icon('solar:map-point-bold-duotone'),
      },
      {
        title: 'Ringkasan & Mitigasi',
        caption: 'Rekomendasi taktis Propam',
        path: '/propam/ringkasan',
        icon: icon('solar:document-text-bold-duotone'),
      },
      {
        title: 'SNA & Flow Propam',
        caption: 'Ground Zero & KOL kasus oknum',
        path: '/propam/sna',
        icon: icon('solar:graph-bold-duotone'),
      },
      {
        title: 'Daftar Isu',
        caption: 'Timeline & berkas sumber indikasi',
        path: '/propam/issues',
        icon: icon('solar:document-text-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Analysis Tools',
    items: [
      {
        title: 'References',
        caption: 'Temuan dan kutipan media',
        path: '/mentions',
        icon: icon('solar:mention-square-bold-duotone'),
      },
      {
        title: 'Metrics',
        caption: 'Grafik dan statistik analitik',
        path: '/analytics',
        icon: icon('solar:chart-bold-duotone'),
      },
      {
        title: 'Hot Topics',
        caption: 'Topik yang sedang trending',
        path: '/trending',
        icon: icon('solar:fire-bold-duotone'),
      },
      {
        title: 'Keyword Analysis',
        caption: 'Analisis kata kunci topik',
        path: '/keywords',
        icon: icon('solar:hashtag-bold-duotone'),
      },
      {
        title: 'AI Insights Hub',
        caption: 'Ringkasan wawasan AI',
        path: '/ai-insights',
        icon: icon('tabler:radar'),
      },
      {
        title: 'Network Maps (SNA)',
        caption: 'Peta jaringan sosial Twitter',
        path: '/sna',
        icon: icon('solar:graph-bold-duotone'),
      },
      {
        title: 'Geolocation',
        caption: 'Analisis sentimen per kota',
        path: '/city-analysis',
        icon: icon('solar:map-point-bold-duotone'),
      },
      {
        title: 'Relationship / Hubungan',
        caption: 'Pemetaan koneksi antar akun Twitter',
        path: '/connection',
        icon: icon('solar:users-group-two-rounded-bold-duotone'),
      },
      {
        title: 'Flow Analysis',
        caption: 'Jalur penyebaran viral Twitter',
        path: '/viral-path',
        icon: icon('solar:graph-up-bold-duotone'),
      },
      {
        title: 'Viral Posts',
        caption: 'Postingan viral FB, IG & TikTok',
        path: '/viral-posts',
        icon: icon('solar:fire-minimalistic-bold-duotone'),
      },
      {
        title: 'KOL',
        caption: 'Key Opinion Leaders & influencer',
        path: '/influencer',
        icon: icon('solar:crown-star-bold-duotone'),
      },
      {
        title: 'Deteksi Ancaman',
        caption: 'Provokator & konten berpotensi hoax',
        path: '/detection',
        icon: icon('solar:shield-warning-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Data Management',
    items: [
      {
        title: 'Topics Settings',
        path: '/topics-settings',
        icon: icon('solar:settings-bold-duotone'),
      },
      {
        title: 'Compare',
        path: '/compare',
        icon: icon('solar:chart-2-bold-duotone'),
      },
      {
        title: 'Export Data',
        path: '/export',
        icon: icon('solar:download-bold-duotone'),
      },
    ],
  },
  {
    subheader: 'Account',
    items: [
      {
        title: 'Profile',
        path: '/profile',
        icon: icon('solar:user-bold-duotone'),
      },
      {
        title: 'Pengaturan Report',
        caption: 'Preferensi WhatsApp & email',
        path: '/propam/report-settings',
        icon: icon('solar:settings-bold-duotone'),
      },
      {
        title: 'Pengaturan Akses',
        caption: 'Cakupan Polda tanpa mengubah workspace',
        path: '/propam/access-settings',
        icon: <ShieldCheck size={18} aria-hidden="true" />,
        roles: ['Operator'],
      },
      {
        title: 'Log Activity',
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
    subheader: 'Management',
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
