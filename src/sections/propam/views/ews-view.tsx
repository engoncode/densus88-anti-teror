import type { EwsLevel } from '../types';

import dayjs from 'dayjs';
import { Siren, Gauge, MapPin, TrendingUp } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { EWS_STYLE } from '../constants';
import { StatCard } from '../components/stat-card';
import { Sparkbars } from '../components/bar-list';
import { PostCard } from '../components/post-card';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { EmptyState, QueryBoundary } from '../components/states';
import { EwsBadge, KeywordChip, CategoryBadge } from '../components/badges';
import { HOUR_RANGES, FilterBar, PropamPage } from '../components/propam-page';

// ----------------------------------------------------------------------

const REFRESH_SECONDS = 120;
const LEVELS: EwsLevel[] = ['awas', 'siaga', 'waspada', 'normal'];

export function EwsView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('hours', 24);

  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.ews(query, signal),
    [query],
    { refreshSeconds: REFRESH_SECONDS }
  );

  return (
    <PropamPage
      title="EWS Paminal"
      subtitle="Peringatan dini eskalasi kemarahan publik terhadap Satwil/Satker berdasarkan lonjakan sentimen negatif."
      icon={Siren}
    >
      <FilterBar
        filters={filters}
        onChange={setFilters}
        rangeOptions={HOUR_RANGES}
        selectedTopic={selectedTopic}
        loading={loading}
        onRefresh={refetch}
        lastUpdated={envelope ? dayjs(envelope.generated_at).format('HH:mm:ss') : undefined}
      />

      <QueryBoundary loading={loading} error={error} hasData={!!data} onRetry={refetch}>
        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Satwil/Satker dipantau" value={data.summary.units_monitored} icon={<MapPin strokeWidth={1.5} className="size-5" />} />
              <StatCard label="Peringatan aktif" value={data.summary.alerts} icon={<Siren strokeWidth={1.5} className="size-5" />} tone="danger" />
              <StatCard label="Level AWAS" value={data.summary.by_level.awas ?? 0} icon={<Gauge strokeWidth={1.5} className="size-5" />} tone="danger" />
              <StatCard label="Level SIAGA" value={data.summary.by_level.siaga ?? 0} icon={<TrendingUp strokeWidth={1.5} className="size-5" />} tone="warning" />
            </div>

            {data.units.length === 0 ? (
              <EmptyState
                title="Belum ada Satwil/Satker teridentifikasi"
                hint="Unit dikenali dari nama dalam teks postingan negatif (mis. Polres Bogor)."
              />
            ) : (
              <div className="space-y-4">
                {LEVELS.map((level) => {
                  const units = data.units.filter((u) => u.level === level);
                  if (units.length === 0) return null;
                  return (
                    <section key={level} aria-label={`Level ${EWS_STYLE[level].label}`} className="space-y-3">
                      {units.map((unit) => (
                        <details
                          key={unit.unit}
                          open={level === 'awas'}
                          className={`rounded-xl border bg-surface p-4 ${EWS_STYLE[unit.level].border}`}
                        >
                          <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                            <EwsBadge level={unit.level} />
                            <span className="text-base font-semibold text-fg">{unit.unit}</span>
                            <CategoryBadge category={unit.top_category} />
                            <span className="ml-auto flex items-center gap-4 text-xs text-fg-muted">
                              <span>
                                <strong className="text-fg">{unit.current_count}</strong> post
                              </span>
                              <span>baseline {unit.baseline_daily_mean}/hari</span>
                              <span>×{unit.spike_ratio}</span>
                              <span>z {unit.z_score}</span>
                            </span>
                          </summary>

                          <div className="mt-4 grid gap-4 lg:grid-cols-3">
                            <div className="space-y-3">
                              <div>
                                <p className="mb-1 text-xs font-medium text-fg-muted">
                                  Tren harian (baseline → saat ini)
                                </p>
                                <Sparkbars values={unit.baseline_series} highlight={unit.current_count} />
                              </div>
                              <p className="text-xs text-fg-muted">
                                {unit.critical_posts} konten berurgensi kritis · {unit.engagement} engagement
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {unit.top_keywords.map((k) => (
                                  <KeywordChip key={k.keyword}>{`${k.keyword} (${k.count})`}</KeywordChip>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3 lg:col-span-2">
                              {unit.sample_posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                              ))}
                            </div>
                          </div>
                        </details>
                      ))}
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </QueryBoundary>
    </PropamPage>
  );
}
