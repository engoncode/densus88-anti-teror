import type { PropamEnvelope } from '../types';

import axios from 'axios';
import { useRef, useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

type Fetcher<TData, TMeta> = (signal: AbortSignal) => Promise<PropamEnvelope<TData, TMeta>>;

type Options = {
  /** Polling interval (detik). 0/undefined = nonaktif. */
  refreshSeconds?: number;
};

export function usePropamQuery<TData, TMeta = Record<string, unknown>>(
  fetcher: Fetcher<TData, TMeta>,
  deps: unknown[],
  { refreshSeconds = 0 }: Options = {}
) {
  const [envelope, setEnvelope] = useState<PropamEnvelope<TData, TMeta> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async (silent: boolean) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (!silent) setLoading(true);
    try {
      const result = await fetcherRef.current(controller.signal);
      setEnvelope(result);
      setError(null);
    } catch (err) {
      if (axios.isCancel(err)) return;
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : 'Gagal memuat data Propam.';
      setError(message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    load(false);
    return () => controllerRef.current?.abort();
  }, [load, depsKey]);

  useEffect(() => {
    if (!refreshSeconds) return undefined;
    const timer = window.setInterval(() => load(true), refreshSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [load, refreshSeconds]);

  const refetch = useCallback(() => load(false), [load]);

  return { envelope, data: envelope?.data ?? null, meta: envelope?.meta ?? null, loading, error, refetch };
}
