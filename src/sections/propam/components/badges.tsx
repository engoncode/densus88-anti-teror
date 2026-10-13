import type { EwsLevel, ZoneLevel, UrgencyLevel, ViolationCategory } from '../types';

import { EWS_STYLE, ZONE_STYLE, CATEGORY_LABEL, URGENCY_STYLE } from '../constants';

// ----------------------------------------------------------------------

const BASE = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium';

export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  return <span className={`${BASE} ${URGENCY_STYLE[level].badge}`}>{URGENCY_STYLE[level].label}</span>;
}

export function EwsBadge({ level }: { level: EwsLevel }) {
  return <span className={`${BASE} ${EWS_STYLE[level].badge}`}>{EWS_STYLE[level].label}</span>;
}

export function ZoneBadge({ zone }: { zone: ZoneLevel }) {
  return <span className={`${BASE} ${ZONE_STYLE[zone].badge}`}>{ZONE_STYLE[zone].label}</span>;
}

export function CategoryBadge({ category }: { category: ViolationCategory | null }) {
  if (!category) return null;
  return <span className={`${BASE} border-line text-fg`}>{CATEGORY_LABEL[category]}</span>;
}

export function KeywordChip({ children }: { children: string }) {
  return (
    <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-fg-muted">
      #{children}
    </span>
  );
}
