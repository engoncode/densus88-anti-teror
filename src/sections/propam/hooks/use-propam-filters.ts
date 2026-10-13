import type { PropamQuery } from '../types';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';

// ----------------------------------------------------------------------

export type SelectedTopic = { id: number; name: string };
export type FilterScope = 'all' | 'selected';

export type PropamFilters = {
  scope: FilterScope;
  /** hours (radar/ews) atau days (menu lain), sesuai `mode`. */
  range: number;
  platform: string;
};

type Mode = 'hours' | 'days';

function readSelectedTopic(): SelectedTopic | null {
  try {
    const stored = localStorage.getItem('selected_topic');
    return stored ? (JSON.parse(stored) as SelectedTopic) : null;
  } catch {
    return null;
  }
}

export function usePropamFilters(mode: Mode, defaultRange: number) {
  const [filters, setFilters] = useState<PropamFilters>({
    scope: 'all',
    range: defaultRange,
    platform: '',
  });
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(readSelectedTopic);

  useEffect(() => {
    const onChange = (event: Event) => setSelectedTopic((event as CustomEvent).detail ?? null);
    window.addEventListener('selectedTopicChanged', onChange);
    return () => window.removeEventListener('selectedTopicChanged', onChange);
  }, []);

  const query = useMemo<PropamQuery>(() => {
    const q: PropamQuery = {};
    if (filters.scope === 'selected' && selectedTopic) q.topic_id = selectedTopic.id;
    if (filters.platform) q.platform = filters.platform;
    if (mode === 'hours') q.hours = filters.range;
    else q.from = dayjs().subtract(filters.range, 'day').format('YYYY-MM-DD');
    return q;
  }, [filters, selectedTopic, mode]);

  return { filters, setFilters, query, selectedTopic };
}
