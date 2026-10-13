type Item = { label: string; value: number; barClass: string };

export function BarList({ items }: { items: Item[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-medium text-fg">{item.label}</span>
            <span className="tabular-nums text-fg-muted">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className={`h-2 rounded-full ${item.barClass}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Mini bar chart (mis. baseline harian). */
export function Sparkbars({ values, highlight }: { values: number[]; highlight?: number }) {
  const max = Math.max(...values, highlight ?? 0, 1);

  return (
    <div className="flex h-10 items-end gap-0.5" aria-hidden="true">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm bg-fg-muted/40"
          style={{ height: `${Math.max((v / max) * 100, 4)}%` }}
        />
      ))}
      {highlight !== undefined && (
        <div
          className="ml-1 w-2 rounded-sm bg-danger"
          style={{ height: `${Math.max((highlight / max) * 100, 4)}%` }}
        />
      )}
    </div>
  );
}
