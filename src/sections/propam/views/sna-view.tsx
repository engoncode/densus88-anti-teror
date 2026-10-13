import dayjs from 'dayjs';
import { Crown, Network } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { formatLag, formatNumber } from '../format';
import { PostCard } from '../components/post-card';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { EmptyState, QueryBoundary } from '../components/states';
import { DAY_RANGES, FilterBar, PropamPage } from '../components/propam-page';

// ----------------------------------------------------------------------

export function SnaView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('days', 7);

  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.sna(query, signal),
    [query]
  );

  return (
    <PropamPage
      title="SNA & Flow Analysis"
      subtitle="Pelacakan Ground Zero dan Key Opinion Leader (KOL) yang memperkuat viralitas kasus oknum."
      icon={Network}
    >
      <FilterBar
        filters={filters}
        onChange={setFilters}
        rangeOptions={DAY_RANGES}
        selectedTopic={selectedTopic}
        loading={loading}
        onRefresh={refetch}
        lastUpdated={envelope ? dayjs(envelope.generated_at).format('HH:mm:ss') : undefined}
      />

      <QueryBoundary loading={loading} error={error} hasData={!!data} onRetry={refetch}>
        {data &&
          (data.clusters.length === 0 ? (
            <EmptyState
              title="Belum ada kluster penyebaran"
              hint="Kluster dibentuk dari konten pelanggaran yang menyebut Satwil/Satker tertentu."
            />
          ) : (
            <div className="space-y-5">
              {data.clusters.map((cluster) => {
                const peak = Math.max(...cluster.timeline.map((t) => t.posts), 1);
                return (
                  <section key={cluster.unit} className="space-y-4 rounded-xl border border-line bg-muted p-4">
                    <header className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-fg">{cluster.unit}</h2>
                      <span className="text-xs text-fg-muted">
                        {cluster.total_posts} konten · {formatNumber(cluster.total_engagement)} engagement
                      </span>
                      <span className="ml-auto flex gap-1.5">
                        {Object.entries(cluster.platforms).map(([platform, count]) => (
                          <span key={platform} className="rounded bg-surface px-2 py-0.5 text-xs text-fg ring-1 ring-line">
                            {platform}: {count}
                          </span>
                        ))}
                      </span>
                    </header>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-fg">Ground Zero (sumber awal)</h3>
                        <PostCard post={cluster.ground_zero} />
                      </div>

                      <div>
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-fg">
                          <Crown strokeWidth={1.5} className="size-4 text-fg-muted" aria-hidden="true" />
                          KOL pemicu viralitas
                        </h3>
                        <ol className="space-y-2">
                          {cluster.kols.map((kol, index) => (
                            <li
                              key={`${kol.platform}-${kol.username}`}
                              className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3 text-sm"
                            >
                              <span className="flex size-6 items-center justify-center rounded-full bg-fg text-xs font-bold text-surface">
                                {index + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-fg">
                                  {kol.url ? (
                                    <a href={kol.url} target="_blank" rel="noreferrer noopener" className="hover:underline">
                                      @{kol.username}
                                    </a>
                                  ) : (
                                    `@${kol.username}`
                                  )}
                                  <span className="ml-1 font-normal text-fg-muted">· {kol.platform}</span>
                                </p>
                                <p className="text-xs text-fg-muted">
                                  {kol.posts} post · {formatNumber(kol.engagement)} engagement · {formatLag(kol.first_post_lag_minutes)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-fg">Alur penyebaran per jam</h3>
                      <div className="flex h-24 items-end gap-1 overflow-x-auto rounded-lg bg-surface p-3 ring-1 ring-line">
                        {cluster.timeline.map((t) => (
                          <div
                            key={t.hour}
                            title={`${dayjs(t.hour).format('DD MMM HH:mm')} — ${t.posts} post`}
                            className="w-3 shrink-0 rounded-sm bg-danger/70"
                            style={{ height: `${(t.posts / peak) * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          ))}
      </QueryBoundary>
    </PropamPage>
  );
}
