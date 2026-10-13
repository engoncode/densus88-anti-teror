import axios from 'axios';
import { useEffect, useState } from 'react';

import { propamAccessService } from 'src/services/propamAccessService';

export const PROPAM_ACCESS_CHANGED = 'propamAccessChanged';

export function usePropamScopeLabel(userId?: number) {
  const [label, setLabel] = useState('Memuat cakupan - EWS Paminal');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const reload = () => setRefresh((value) => value + 1);
    window.addEventListener(PROPAM_ACCESS_CHANGED, reload);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener(PROPAM_ACCESS_CHANGED, reload);
      window.removeEventListener('focus', reload);
    };
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    const controller = new AbortController();
    setLabel('Memuat cakupan - EWS Paminal');
    propamAccessService.scope(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        const code = result.meta.locked_polda;
        const name = code ? result.data.find((option) => option.code === code)?.name : 'Nasional';
        if (!name) throw new Error('Nama Polda yang ditugaskan tidak tersedia dalam katalog.');
        setLabel(`${name} - EWS Paminal`);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || axios.isCancel(error)) return;
        console.error('Gagal memuat cakupan sidebar Propam:', error);
        setLabel('Cakupan tidak tersedia - EWS Paminal');
      });
    return () => controller.abort();
  }, [userId, refresh]);

  return label;
}
