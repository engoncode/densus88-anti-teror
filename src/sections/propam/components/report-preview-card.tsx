import { useState } from 'react';
import { Copy, Check, RefreshCw, FileText } from 'lucide-react';

import { reportPreviewService } from 'src/services/reportSettingsService';

import { ErrorState, LoadingState } from './states';
import { usePropamQuery } from '../hooks/use-propam-query';

// ----------------------------------------------------------------------

const BUTTON =
  'inline-flex size-8 items-center justify-center rounded-md border border-line text-fg-muted hover:bg-hover hover:text-fg disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand';

export function ReportPreviewCard() {
  const { data, loading, error, refetch } = usePropamQuery(
    (signal) => reportPreviewService.get(signal),
    []
  );
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.whatsapp_text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface p-6" aria-labelledby="report-preview-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="report-preview-title" className="flex items-center gap-2 text-base font-semibold text-fg">
            <FileText className="size-5" strokeWidth={1.5} aria-hidden="true" /> Preview Laporan
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            Data 24 jam terakhir dari seluruh topik dalam akses Anda. Format ini yang akan dikirim.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={copy} disabled={!data} className={BUTTON}
            aria-label={copied ? 'Teks tersalin' : 'Salin teks laporan'} title="Salin teks">
            {copied
              ? <Check className="size-4" strokeWidth={1.5} aria-hidden="true" />
              : <Copy className="size-4" strokeWidth={1.5} aria-hidden="true" />}
          </button>
          <button type="button" onClick={refetch} disabled={loading} className={BUTTON}
            aria-label="Muat ulang preview" title="Muat ulang">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading && !data ? (
          <LoadingState label="Menyusun laporan…" />
        ) : data && (
          <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-muted p-4 font-mono text-[13px] leading-relaxed text-fg">
            {data.whatsapp_text}
          </pre>
        )}
      </div>
      <span role="status" className="sr-only">{copied ? 'Teks laporan tersalin' : ''}</span>
    </section>
  );
}
