import type {
  EwsData,
  DumasData,
  RadarData,
  RadarMeta,
  SnaData,
  RedZoneData,
  PropamQuery,
  RingkasanData,
  PropamEnvelope,
  KategorisasiData,
  IssuesData,
  IssueDetailData,
  IssuesMeta,
} from 'src/sections/propam/types';

import api from './api';

// ----------------------------------------------------------------------

const BASE = '/v1/propam';

async function get<TData, TMeta = Record<string, unknown>>(
  path: string,
  params: PropamQuery,
  signal?: AbortSignal
): Promise<PropamEnvelope<TData, TMeta>> {
  const { data } = await api.get<PropamEnvelope<TData, TMeta>>(`${BASE}/${path}`, {
    params,
    signal,
  });
  return data;
}

export const propamService = {
  radar: (p: PropamQuery, s?: AbortSignal) => get<RadarData, RadarMeta>('radar', p, s),
  dumas: (p: PropamQuery, s?: AbortSignal) => get<DumasData>('dumas', p, s),
  kategorisasi: (p: PropamQuery, s?: AbortSignal) => get<KategorisasiData>('kategorisasi', p, s),
  ews: (p: PropamQuery, s?: AbortSignal) => get<EwsData>('ews', p, s),
  redZone: (p: PropamQuery, s?: AbortSignal) => get<RedZoneData>('red-zone', p, s),
  ringkasan: (p: PropamQuery, s?: AbortSignal) => get<RingkasanData>('ringkasan', p, s),
  sna: (p: PropamQuery, s?: AbortSignal) => get<SnaData>('sna', p, s),
  issues: (p: PropamQuery, s?: AbortSignal) => get<IssuesData, IssuesMeta>('issues', p, s),
  issue: (id: string, p: PropamQuery, s?: AbortSignal) =>
    get<IssueDetailData, IssuesMeta>(`issues/${id}`, p, s),
};
