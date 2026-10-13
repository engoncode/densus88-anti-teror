import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Helmet } from 'react-helmet-async';
import { RefreshCw } from 'lucide-react';

import { PLATFORM_OPTIONS } from '../constants';

import type { PropamFilters, SelectedTopic } from '../hooks/use-propam-filters';

// ----------------------------------------------------------------------

type PageProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function PropamPage({ title, subtitle, icon: Icon, children }: PageProps) {
  return (
    <>
      <Helmet>
        <title>{`${title} | Propam EWS`}</title>
      </Helmet>
      <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 [--spacing:0.25rem]">
        <header className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-fg">
            <Icon strokeWidth={1.5} className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-fg">{title}</h1>
            <p className="text-sm text-fg-muted">{subtitle}</p>
          </div>
        </header>
        {children}
      </div>
    </>
  );
}

// ----------------------------------------------------------------------

type RangeOption = { value: number; label: string };

type FilterBarProps = {
  filters: PropamFilters;
  onChange: (next: PropamFilters) => void;
  rangeOptions: RangeOption[];
  selectedTopic: SelectedTopic | null;
  loading: boolean;
  onRefresh: () => void;
  hidePlatform?: boolean;
  extra?: ReactNode;
  lastUpdated?: string;
};

const SELECT =
  'rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand';

export function FilterBar({
  filters,
  onChange,
  rangeOptions,
  selectedTopic,
  loading,
  onRefresh,
  hidePlatform,
  extra,
  lastUpdated,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-3">
      <label className="flex items-center gap-2 text-xs font-medium text-fg-muted">
        Cakupan
        <select
          className={SELECT}
          value={filters.scope}
          onChange={(e) => onChange({ ...filters, scope: e.target.value as PropamFilters['scope'] })}
        >
          <option value="all">Semua topik</option>
          <option value="selected" disabled={!selectedTopic}>
            {selectedTopic ? `Topik: ${selectedTopic.name}` : 'Topik terpilih (belum ada)'}
          </option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs font-medium text-fg-muted">
        Periode
        <select
          className={SELECT}
          value={filters.range}
          onChange={(e) => onChange({ ...filters, range: Number(e.target.value) })}
        >
          {rangeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {!hidePlatform && (
        <label className="flex items-center gap-2 text-xs font-medium text-fg-muted">
          Platform
          <select
            className={SELECT}
            value={filters.platform}
            onChange={(e) => onChange({ ...filters, platform: e.target.value })}
          >
            {PLATFORM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {extra}

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {lastUpdated && <span className="text-xs text-fg-muted">Diperbarui {lastUpdated}</span>}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-busy={loading}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-fg hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <RefreshCw strokeWidth={1.5} className={`size-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Muat ulang
        </button>
      </div>
    </div>
  );
}

export const HOUR_RANGES: RangeOption[] = [
  { value: 6, label: '6 jam' },
  { value: 24, label: '24 jam' },
  { value: 48, label: '48 jam' },
  { value: 72, label: '3 hari' },
  { value: 168, label: '7 hari' },
];

export const DAY_RANGES: RangeOption[] = [
  { value: 3, label: '3 hari' },
  { value: 7, label: '7 hari' },
  { value: 14, label: '14 hari' },
  { value: 30, label: '30 hari' },
];
