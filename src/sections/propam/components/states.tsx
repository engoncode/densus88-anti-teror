import type { ReactNode } from 'react';

import { Inbox, RefreshCw, LoaderCircle, TriangleAlert } from 'lucide-react';

// ----------------------------------------------------------------------

export function LoadingState({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line py-16 text-fg-muted"
    >
      <LoaderCircle strokeWidth={1.5} className="size-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/30 bg-danger/10 py-12 text-danger"
    >
      <TriangleAlert strokeWidth={1.5} className="size-6" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-md bg-fg px-3 py-1.5 text-sm font-medium text-surface hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <RefreshCw strokeWidth={1.5} className="size-4" aria-hidden="true" />
        Coba lagi
      </button>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-14 text-center text-fg-muted">
      <Inbox strokeWidth={1.5} className="size-6" aria-hidden="true" />
      <p className="text-sm font-medium text-fg">{title}</p>
      {hint && <p className="max-w-md text-xs">{hint}</p>}
    </div>
  );
}

type BoundaryProps = {
  loading: boolean;
  error: string | null;
  hasData: boolean;
  onRetry: () => void;
  children: ReactNode;
};

/** Menampilkan loading hanya pada pemuatan pertama; refresh berikutnya tidak mengosongkan layar. */
export function QueryBoundary({ loading, error, hasData, onRetry, children }: BoundaryProps) {
  if (error && !hasData) return <ErrorState message={error} onRetry={onRetry} />;
  if (loading && !hasData) return <LoadingState />;
  return <>{children}</>;
}
