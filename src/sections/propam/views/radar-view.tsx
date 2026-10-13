import type { UrgencyLevel } from '../types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Flame, Radar, Siren, ShieldAlert } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { StatCard } from '../components/stat-card';
import { PostList } from '../components/post-card';
import { Pagination } from '../components/pagination';
import { EmptyState, QueryBoundary } from '../components/states';
import { UrgencyFilter } from '../components/urgency-filter';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { HOUR_RANGES, FilterBar, PropamPage } from '../components/propam-page';

// ----------------------------------------------------------------------

const REFRESH_SECONDS = 60;

export function RadarView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('hours', 24);
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('');
  const [page, setPage] = useState(1);

  const params = { ...query, ...(urgency && { urgency }), page, limit: 20 };
  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.radar(params, signal),
    [params],
    { refreshSeconds: REFRESH_SECONDS }
  );

  return (
    <PropamPage
      title="Radar Oknum Viral"
      subtitle="Deteksi real-time konten negatif yang berpotensi memviralkan tindakan indisipliner personel."
      icon={Radar}
    >
      <FilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
        rangeOptions={HOUR_RANGES}
        selectedTopic={selectedTopic}
        loading={loading}
        onRefresh={refetch}
        lastUpdated={envelope ? dayjs(envelope.generated_at).format('HH:mm:ss') : undefined}
        extra={
          <UrgencyFilter
            value={urgency}
            onChange={(v) => {
              setUrgency(v);
              setPage(1);
            }}
          />
        }
      />

      <QueryBoundary loading={loading} error={error} hasData={!!data} onRetry={refetch}>
        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Konten terdeteksi" value={data.summary.total} icon={<Radar strokeWidth={1.5} className="size-5" />} />
              <StatCard label="Berpotensi viral" value={data.summary.viral} icon={<Flame strokeWidth={1.5} className="size-5" />} tone="warning" />
              <StatCard label="Urgensi kritis" value={data.summary.by_urgency.critical} icon={<Siren strokeWidth={1.5} className="size-5" />} tone="danger" />
              <StatCard label="Urgensi tinggi" value={data.summary.by_urgency.high} icon={<ShieldAlert strokeWidth={1.5} className="size-5" />} tone="warning" />
            </div>

            {data.items.data.length === 0 ? (
              <EmptyState
                title="Tidak ada konten terdeteksi"
                hint="Belum ada postingan negatif dengan kata kunci pelanggaran pada periode ini."
              />
            ) : (
              <>
                <PostList posts={data.items.data} />
                <Pagination page={page} limit={data.items.limit} total={data.items.total} onChange={setPage} />
              </>
            )}
            <p className="text-xs text-fg-muted">
              Auto-refresh setiap {REFRESH_SECONDS} detik · Ambang viral skor ≥ {envelope?.meta.viral_threshold}
            </p>
          </>
        )}
      </QueryBoundary>
    </PropamPage>
  );
}
