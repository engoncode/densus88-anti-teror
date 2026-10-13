import type { UrgencyLevel } from '../types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Siren, Users, ShieldAlert, MessageSquareWarning } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { BarList } from '../components/bar-list';
import { StatCard } from '../components/stat-card';
import { PostList } from '../components/post-card';
import { URGENCY_STYLE, URGENCY_LEVELS } from '../constants';
import { Pagination } from '../components/pagination';
import { EmptyState, QueryBoundary } from '../components/states';
import { UrgencyFilter } from '../components/urgency-filter';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { DAY_RANGES, FilterBar, PropamPage } from '../components/propam-page';

// ----------------------------------------------------------------------

export function DumasView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('days', 7);
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('');
  const [page, setPage] = useState(1);

  const params = { ...query, ...(urgency && { urgency }), page, limit: 20 };
  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.dumas(params, signal),
    [params]
  );

  const reset = () => setPage(1);

  return (
    <PropamPage
      title="Sentimen & Propaganda Publik"
      subtitle="Reaksi publik terhadap narasi ekstremisme dan upaya penegakan hukum, disaring berdasarkan tingkat urgensi."
      icon={MessageSquareWarning}
    >
      <FilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          reset();
        }}
        rangeOptions={DAY_RANGES}
        selectedTopic={selectedTopic}
        loading={loading}
        onRefresh={refetch}
        lastUpdated={envelope ? dayjs(envelope.generated_at).format('HH:mm:ss') : undefined}
        extra={
          <UrgencyFilter
            value={urgency}
            onChange={(v) => {
              setUrgency(v);
              reset();
            }}
          />
        }
      />

      <QueryBoundary loading={loading} error={error} hasData={!!data} onRetry={refetch}>
        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Total konten" value={data.summary.total} icon={<Users strokeWidth={1.5} className="size-5" />} />
              <StatCard label="Kritis" value={data.summary.by_urgency.critical} icon={<Siren strokeWidth={1.5} className="size-5" />} tone="danger" />
              <StatCard label="Tinggi" value={data.summary.by_urgency.high} icon={<ShieldAlert strokeWidth={1.5} className="size-5" />} tone="warning" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="space-y-4 lg:col-span-1">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h2 className="mb-3 text-sm font-semibold text-fg">Sebaran urgensi</h2>
                  <BarList
                    items={URGENCY_LEVELS.map((l) => ({
                      label: URGENCY_STYLE[l].label,
                      value: data.summary.by_urgency[l],
                      barClass: URGENCY_STYLE[l].bar,
                    }))}
                  />
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <h2 className="mb-3 text-sm font-semibold text-fg">Platform sumber</h2>
                  {Object.keys(data.summary.by_platform).length === 0 ? (
                    <p className="text-xs text-fg-muted">Belum ada data.</p>
                  ) : (
                    <BarList
                      items={Object.entries(data.summary.by_platform).map(([label, value]) => ({
                        label,
                        value,
                        barClass: 'bg-brand',
                      }))}
                    />
                  )}
                </div>
              </section>

              <section className="space-y-3 lg:col-span-2">
                {data.items.data.length === 0 ? (
                  <EmptyState title="Tidak ada konten" hint="Ubah filter urgensi atau perluas periode." />
                ) : (
                  <>
                    <PostList posts={data.items.data} />
                    <Pagination page={page} limit={data.items.limit} total={data.items.total} onChange={setPage} />
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </QueryBoundary>
    </PropamPage>
  );
}
