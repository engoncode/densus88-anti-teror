import type { PropamQuery, UrgencyLevel } from '../types';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { ArrowLeft, Files, Layers, ExternalLink } from 'lucide-react';

import { propamService } from 'src/services/propamService';

import { formatDateTime } from '../format';
import { StatCard } from '../components/stat-card';
import { Pagination } from '../components/pagination';
import { CategoryBadge, UrgencyBadge } from '../components/badges';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { UrgencyFilter } from '../components/urgency-filter';
import { usePropamFilters } from '../hooks/use-propam-filters';
import { usePropamQuery } from '../hooks/use-propam-query';
import { DAY_RANGES, FilterBar, PropamPage } from '../components/propam-page';

const BUTTON = 'inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold text-fg hover:bg-hover focus-visible:outline-2 focus-visible:outline-brand';

function sourceUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}

function IssueDetail({ id, query, onBack }: { id: string; query: PropamQuery; onBack: () => void }) {
  const [page, setPage] = useState(1);
  const params = { ...query, page, limit: 20 };
  const { data, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.issue(id, params, signal), [id, params]
  );
  return (
    <section className="space-y-4" aria-label="Detail isu">
      <button type="button" className={BUTTON} onClick={onBack}>
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden="true" /> Kembali ke daftar isu
      </button>
      {error ? <ErrorState message={error} onRetry={refetch} /> : loading ? <LoadingState /> : data && (
        <>
          <h2 className="text-lg font-bold text-fg">{data.issue.title}</h2>
          <section className="rounded-xl border border-line bg-surface p-4">
            <h3 className="text-sm font-semibold text-fg">Timeline volume posting terpantau</h3>
            <p className="text-xs text-fg-muted">
              Waktu mengikuti zona server. Ini bukan grafik pertumbuhan engagement atau bukti jalur penyebaran.
            </p>
            <ol className="mt-4 max-h-80 space-y-3 overflow-y-auto" aria-label="Timeline posting">
              {data.issue.timeline.map((entry) => (
                <li key={entry.hour} className="flex flex-wrap items-center gap-3 text-xs">
                  <time className="w-36 shrink-0 text-fg-muted">{entry.hour}</time>
                  <progress
                    aria-label={`${entry.hour}: ${entry.posts} posting`}
                    value={entry.posts}
                    max={Math.max(...data.issue.timeline.map((point) => point.posts), 1)}
                    className="h-2 min-w-16 flex-1 accent-brand"
                  />
                  <span className="text-fg">{entry.posts} posting</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="space-y-3" aria-label="Berkas sumber">
            <h3 className="text-sm font-semibold text-fg">Berkas sumber · {data.sources.total} posting</h3>
            <p className="text-xs text-fg-muted">
              Kutipan dipotong dari data crawl, bukan arsip bukti forensik. Tautan asli dapat berubah atau hilang.
            </p>
            {data.sources.data.map((post) => {
              const url = sourceUrl(post.url);
              return (
                <article key={post.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                    <span className="font-semibold text-fg">{post.author.username ?? 'Akun tidak tersedia'}</span>
                    <span>{post.platform ?? 'Platform tidak tersedia'}</span>
                    <span>ID data: {post.id}</span>
                  </div>
                  <blockquote className="mx-0 my-3 border-l-2 border-line pl-3 text-sm leading-relaxed break-words text-fg">
                    {post.text}
                  </blockquote>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-fg-muted">
                    <span>Waktu posting terdata: {formatDateTime(post.posted_at)}</span>
                    <span>Tercatat di database: {post.collected_at ? formatDateTime(post.collected_at) : 'Tidak tersedia'}</span>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">
                        Buka sumber <ExternalLink className="size-3" strokeWidth={1.5} aria-hidden="true" />
                      </a>
                    ) : <span>Tautan tidak tersedia atau tidak valid</span>}
                  </div>
                </article>
              );
            })}
            <Pagination page={page} limit={data.sources.limit} total={data.sources.total} onChange={setPage} />
          </section>
        </>
      )}
    </section>
  );
}

export function IssuesView() {
  const { filters, setFilters, query, selectedTopic } = usePropamFilters('days', 7);
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = { ...query, ...(urgency && { urgency }), page, limit: 10 };
  const { data, envelope, meta, loading, error, refetch } = usePropamQuery(
    (signal) => propamService.issues(params, signal), [params]
  );
  const detailKey = JSON.stringify(query);
  useEffect(() => {
    setSelectedId(null);
    setPage(1);
  }, [detailKey]);

  return (
    <PropamPage title="Isu & Bukti Digital" subtitle="Kelompok indikasi dari posting publik, timeline, dan sumber pendukung OSINT." icon={Files}>
      <FilterBar
        filters={filters}
        onChange={(next) => { setFilters(next); setPage(1); setSelectedId(null); }}
        rangeOptions={DAY_RANGES}
        selectedTopic={selectedTopic}
        loading={loading}
        onRefresh={() => { setSelectedId(null); void refetch(); }}
        lastUpdated={envelope ? dayjs(envelope.generated_at).format('HH:mm:ss') : undefined}
        extra={<UrgencyFilter value={urgency} onChange={(value) => { setUrgency(value); setPage(1); setSelectedId(null); }} />}
      />
      <aside className="rounded-xl border border-line bg-muted p-4 text-xs leading-relaxed text-fg-muted">
        <strong className="text-fg">Indikasi — belum diverifikasi.</strong> Kelompok otomatis berbasis kemiripan teks,
        bukan jumlah kasus resmi atau bukti hukum. Wilayah/kelompok yang disebut belum tentu terafiliasi jaringan terorisme.
        Waktu paling awal hanya berlaku pada data/filter terpantau, bukan bukti pencetus isu.
      </aside>
      {meta?.truncated && (
        <p role="alert" className="text-sm text-warn">
          Data dibatasi {meta.max_rows} posting negatif terbaru. Jumlah, kelompok, dan timeline mungkin belum lengkap; persempit periode/topik.
        </p>
      )}
      {error ? <ErrorState message={error} onRetry={refetch} /> : loading ? <LoadingState /> : data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Kelompok indikasi" value={data.summary.issues} icon={<Layers strokeWidth={1.5} />} hint="Bukan jumlah kasus terverifikasi" />
            <StatCard label="Posting dalam kelompok" value={data.summary.posts} icon={<Files strokeWidth={1.5} />} hint="Sesuai cakupan dan filter aktif" />
          </div>
          {selectedId ? <IssueDetail key={`${selectedId}:${detailKey}`} id={selectedId} query={query} onBack={() => setSelectedId(null)} /> : (
            <section className="space-y-3" aria-label="Daftar kelompok isu">
              {!data.items.total ? <EmptyState title="Belum ada indikasi isu" hint="Perluas periode atau ubah filter." /> : data.items.data.map((issue) => (
                <article key={issue.id} className="space-y-3 rounded-xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <UrgencyBadge level={issue.urgency.level} /><CategoryBadge category={issue.category} />
                    <span className="text-xs text-fg-muted">Belum diverifikasi</span>
                  </div>
                  <h2 className="text-base font-semibold break-words text-fg">{issue.title}</h2>
                  <p className="text-xs text-fg-muted">Wilayah/kelompok disebut: {issue.unit_mentioned ?? 'Belum dikenali'} · Topik ID {issue.topic_id}</p>
                  <p className="text-xs text-fg-muted">
                    {issue.post_count} posting · {issue.unique_sources} identitas sumber · {Object.keys(issue.platforms).join(', ')}
                  </p>
                  <p className="text-xs text-fg-muted">
                    Posting paling awal terpantau: {formatDateTime(issue.first_observed_post_at)} · Terakhir: {formatDateTime(issue.latest_observed_post_at)}
                  </p>
                  <button type="button" className={BUTTON} onClick={() => setSelectedId(issue.id)}>Lihat timeline &amp; berkas sumber</button>
                </article>
              ))}
              <Pagination page={page} limit={data.items.limit} total={data.items.total} onChange={setPage} />
            </section>
          )}
        </>
      )}
    </PropamPage>
  );
}
