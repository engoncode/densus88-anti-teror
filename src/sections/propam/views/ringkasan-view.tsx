import dayjs from 'dayjs';
import { Clock, FileText, ListChecks, TriangleAlert } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { BarList } from '../components/bar-list';
import { StatCard } from '../components/stat-card';
import { PostCard } from '../components/post-card';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { QueryBoundary, EmptyState } from '../components/states';
import { EwsBadge, ZoneBadge, CategoryBadge } from '../components/badges';
import { DAY_RANGES, FilterBar, PropamPage } from '../components/propam-page';
import { EWS_STYLE, CATEGORY_LABEL } from '../constants';

import type { ViolationCategory } from '../types';

// ----------------------------------------------------------------------

export function RingkasanView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('days', 7);

  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.ringkasan(query, signal),
    [query]
  );

  return (
    <PropamPage
      title="Ringkasan & Mitigasi"
      subtitle="Rangkuman situasi disertai rekomendasi preventif dan kontra-narasi untuk tindak lanjut pimpinan."
      icon={FileText}
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
        {data && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Postingan negatif" value={data.overview.negative_posts} icon={<TriangleAlert strokeWidth={1.5} className="size-5" />} />
              <StatCard
                label="Indikasi ancaman"
                value={data.overview.violation_posts}
                hint={`${data.overview.violation_ratio_pct}% dari negatif`}
                icon={<FileText strokeWidth={1.5} className="size-5" />}
                tone="warning"
              />
              <StatCard label="Urgensi kritis" value={data.overview.by_urgency.critical} icon={<TriangleAlert strokeWidth={1.5} className="size-5" />} tone="danger" />
              <StatCard label="Peringatan EWS" value={data.ews_alerts.length} icon={<Clock strokeWidth={1.5} className="size-5" />} tone="danger" />
            </div>

            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-fg">
                <ListChecks strokeWidth={1.5} className="size-5" aria-hidden="true" />
                Rekomendasi taktis
              </h2>
              {data.recommendations.length === 0 ? (
                <EmptyState title="Tidak ada tindakan mendesak" hint="Tidak ada unit pada level waspada atau lebih tinggi." />
              ) : (
                data.recommendations.map((rec) => (
                  <article
                    key={`${rec.target}-${rec.priority}`}
                    className={`rounded-xl border bg-surface p-4 ${EWS_STYLE[rec.priority].border}`}
                  >
                    <header className="flex flex-wrap items-center gap-2">
                      <EwsBadge level={rec.priority} />
                      <h3 className="text-base font-semibold text-fg">{rec.target}</h3>
                      <CategoryBadge category={rec.category} />
                      <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-fg-muted">
                        <Clock strokeWidth={1.5} className="size-3" aria-hidden="true" />
                        SLA {rec.sla}
                      </span>
                    </header>
                    <p className="mt-2 text-sm text-fg-muted">{rec.rationale}</p>
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-fg">
                      {rec.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ol>
                    {rec.reference_url && (
                      <a
                        href={rec.reference_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-2 inline-block text-xs font-medium text-brand hover:underline"
                      >
                        Lihat konten rujukan
                      </a>
                    )}
                  </article>
                ))
              )}
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-xl border border-line bg-surface p-4">
                <h2 className="mb-3 text-sm font-semibold text-fg">Kategori sel & modus operandi</h2>
                {Object.keys(data.overview.by_category).length === 0 ? (
                  <p className="text-xs text-fg-muted">Belum ada data.</p>
                ) : (
                  <BarList
                    items={(Object.entries(data.overview.by_category) as [ViolationCategory, number][]).map(
                      ([key, value]) => ({ label: CATEGORY_LABEL[key], value, barClass: 'bg-brand' })
                    )}
                  />
                )}
              </section>

              <section className="rounded-xl border border-line bg-surface p-4">
                <h2 className="mb-3 text-sm font-semibold text-fg">Titik rawan teratas</h2>
                {data.red_zones.length === 0 ? (
                  <p className="text-xs text-fg-muted">Belum ada data geolokasi.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.red_zones.map((z) => (
                      <li key={`${z.label}-${z.lat}`} className="flex items-center justify-between text-sm">
                        <span className="text-fg">{z.label}</span>
                        <ZoneBadge zone={z.zone} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-line bg-surface p-4">
                <h2 className="mb-3 text-sm font-semibold text-fg">Ground Zero & KOL</h2>
                {data.ground_zero.length === 0 ? (
                  <p className="text-xs text-fg-muted">Belum ada kluster.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {data.ground_zero.map((g) => (
                      <li key={g.unit}>
                        <p className="font-semibold text-fg">{g.unit}</p>
                        <p className="text-xs text-fg-muted">
                          Sumber: @{g.ground_zero.author.username ?? 'tanpa-nama'} ({g.ground_zero.platform})
                        </p>
                        <p className="text-xs text-fg-muted">
                          KOL: {g.kols.map((k) => `@${k.username}`).join(', ') || '-'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-fg">Konten paling viral</h2>
              {data.top_viral.length === 0 ? (
                <EmptyState title="Belum ada konten viral" />
              ) : (
                data.top_viral.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </section>
          </>
        )}
      </QueryBoundary>
    </PropamPage>
  );
}
