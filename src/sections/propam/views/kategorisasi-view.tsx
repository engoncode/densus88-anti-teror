import type { ViolationCategory } from '../types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Tags } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { BarList } from '../components/bar-list';
import { PostList } from '../components/post-card';
import { Pagination } from '../components/pagination';
import { CATEGORY_LABEL } from '../constants';
import { EmptyState, QueryBoundary } from '../components/states';
import { usePropamQuery } from '../hooks/use-propam-query';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { DAY_RANGES, FilterBar, PropamPage } from '../components/propam-page';

// ----------------------------------------------------------------------

export function KategorisasiView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('days', 7);
  const [category, setCategory] = useState<ViolationCategory | ''>('');
  const [page, setPage] = useState(1);

  const params = { ...query, ...(category && { category }), page, limit: 20 };
  const { envelope, data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.kategorisasi(params, signal),
    [params]
  );

  const select = (next: ViolationCategory | '') => {
    setCategory(next);
    setPage(1);
  };

  return (
    <PropamPage
      title="Kategorisasi Sel & Modus Operandi"
      subtitle="Klasifikasi otomatis: Propaganda Daring, Rekrutmen Tertutup, Pendanaan Terorisme (Fa'i), dan Persiapan Amaliyah."
      icon={Tags}
    >
      <FilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
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
              {data.categories.map((c) => {
                const active = category === c.category;
                return (
                  <button
                    key={c.category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(active ? '' : c.category)}
                    className={`rounded-xl border p-4 text-left transition ${
                      active ? 'border-fg bg-fg text-surface' : 'border-line bg-surface hover:border-fg-muted'
                    }`}
                  >
                    <p className={`text-xs font-medium ${active ? 'text-fg-muted' : 'text-fg-muted'}`}>{CATEGORY_LABEL[c.category]}</p>
                    <p className="text-2xl font-bold">{c.count}</p>
                    <p className={`text-xs ${active ? 'text-fg-muted' : 'text-fg-muted'}`}>
                      {c.percentage}% · {c.critical} kritis
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section className="rounded-xl border border-line bg-surface p-4 lg:col-span-1">
                <h2 className="mb-3 text-sm font-semibold text-fg">Komposisi kategori</h2>
                <BarList
                  items={data.categories.map((c) => ({
                    label: CATEGORY_LABEL[c.category],
                    value: c.count,
                    barClass: 'bg-brand',
                  }))}
                />
                <p className="mt-4 text-xs text-fg-muted">
                  {data.multi_category} dari {data.total} konten memenuhi lebih dari satu kategori.
                </p>
              </section>

              <section className="space-y-3 lg:col-span-2">
                {data.items.data.length === 0 ? (
                  <EmptyState title="Tidak ada konten pada kategori ini" />
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
