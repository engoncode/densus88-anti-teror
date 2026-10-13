import type { ReactNode } from 'react';

// ----------------------------------------------------------------------

type Props = {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  tone?: 'default' | 'danger' | 'warning';
};

const TONE = {
  default: 'text-brand',
  danger: 'text-danger',
  warning: 'text-fg-muted',
};

export function StatCard({ label, value, icon, hint, tone = 'default' }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-5 rounded-2xl border border-line bg-surface p-6 shadow-sm">
      <p className="m-0 text-sm font-semibold text-fg">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <p className="m-0 min-w-0 break-words text-3xl font-bold leading-tight tracking-tight text-fg tabular-nums">
          {value}
        </p>
        <div
          aria-hidden="true"
          className={`flex size-10 shrink-0 items-center justify-center [&>svg]:size-8 ${TONE[tone]}`}
        >
          {icon}
        </div>
      </div>
      <p className="m-0 text-xs leading-relaxed text-fg-muted">{hint ?? 'Sesuai filter aktif'}</p>
    </div>
  );
}
