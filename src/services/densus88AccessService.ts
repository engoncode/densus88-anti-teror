import api from './api';

export interface AccessUser {
  id: number;
  name: string;
  email: string;
  role: { id: number; name: string } | null;
  polda: string | null;
  is_blocked: boolean;
}

export interface AccessUserPage {
  data: AccessUser[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface PoldaOption {
  code: string;
  name: string;
}

export const densus88AccessService = {
  async scope(signal?: AbortSignal) {
    const response = await api.get<{
      data: PoldaOption[];
      meta: { locked_polda: string | null };
    }>('/v1/densus88/polda/options', { signal });
    return response.data;
  },
  async users(search: string, page: number, signal?: AbortSignal) {
    const response = await api.get<{ data: AccessUserPage; meta: { poldas: PoldaOption[] } }>('/v1/densus88/access-settings', {
      params: { search: search || undefined, page },
      signal,
    });
    return response.data;
  },
  async save(userId: number, polda: string | null) {
    const response = await api.put<{ message: string; data: { id: number; polda: string | null } }>(
      `/v1/densus88/access-settings/users/${userId}`,
      { polda }
    );
    return response.data;
  },
};
