import type { UrgencyLevel } from '../types';

import { URGENCY_STYLE, URGENCY_LEVELS } from '../constants';

type Props = {
  value: UrgencyLevel | '';
  onChange: (value: UrgencyLevel | '') => void;
};

export function UrgencyFilter({ value, onChange }: Props) {
  const options: { value: UrgencyLevel | ''; label: string }[] = [
    { value: '', label: 'Semua' },
    ...URGENCY_LEVELS.map((l) => ({ value: l, label: URGENCY_STYLE[l].label })),
  ];

  return (
    <div role="group" aria-label="Filter urgensi" className="flex items-center gap-1">
      <span className="mr-1 text-xs font-medium text-fg-muted">Urgensi</span>
      {options.map((o) => (
        <button
          key={o.value || 'all'}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
            value === o.value
              ? 'border-fg bg-fg text-surface'
              : 'border-line bg-surface text-fg hover:bg-hover'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
