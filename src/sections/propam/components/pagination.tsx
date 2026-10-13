import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, limit, total, onChange }: Props) {
  const pages = Math.max(Math.ceil(total / limit), 1);
  if (pages <= 1) return null;

  const BTN =
    'inline-flex size-8 items-center justify-center rounded-md border border-line bg-surface text-fg hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav className="flex items-center justify-end gap-3 pt-2" aria-label="Paginasi">
      <span className="text-xs text-fg-muted">
        Halaman {page} dari {pages} · {total} item
      </span>
      <button type="button" className={BTN} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Halaman sebelumnya">
        <ChevronLeft strokeWidth={1.5} className="size-4" aria-hidden="true" />
      </button>
      <button type="button" className={BTN} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Halaman berikutnya">
        <ChevronRight strokeWidth={1.5} className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
