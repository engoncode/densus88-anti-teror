import dayjs from 'dayjs';

export const formatNumber = (value: number) => new Intl.NumberFormat('id-ID').format(value);

export const formatDateTime = (iso: string) => dayjs(iso).format('DD MMM YYYY, HH:mm');

export const formatLag = (minutes: number) => {
  if (minutes <= 0) return 'Sumber awal';
  if (minutes < 60) return `+${minutes} mnt`;
  return `+${Math.round(minutes / 60)} jam`;
};
