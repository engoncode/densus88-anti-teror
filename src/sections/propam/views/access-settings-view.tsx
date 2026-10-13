import type { FormEvent } from 'react';
import type { AccessUser, AccessUserPage, PoldaOption } from 'src/services/propamAccessService';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Globe, Save, Search, ShieldCheck, LoaderCircle } from 'lucide-react';

import { propamAccessService } from 'src/services/propamAccessService';
import { useAuth } from 'src/contexts/AuthContext';

import { PropamPage } from '../components/propam-page';
import { EmptyState, ErrorState, LoadingState } from '../components/states';
import { PROPAM_ACCESS_CHANGED } from '../hooks/use-propam-scope-label';

const CONTROL = 'rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60';
const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-fg hover:bg-hover focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60';

function errorMessage(error: unknown): string {
  return axios.isAxiosError<{ message?: string }>(error) && error.response?.data.message
    ? error.response.data.message
    : 'Gagal menghubungi API pengaturan akses Propam.';
}

type AccessRowProps = {
  user: AccessUser;
  options: PoldaOption[];
  busy: boolean;
  saving: boolean;
  onSave: (user: AccessUser, polda: string | null) => Promise<void>;
};

function AccessRow({ user, options, busy, saving, onSave }: AccessRowProps) {
  const [draft, setDraft] = useState(user.polda ?? '');
  const [confirmed, setConfirmed] = useState(false);
  const changed = draft !== (user.polda ?? '');
  const expanding = changed && draft === '';
  const knownPolda = !draft || options.some((option) => option.code === draft);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !changed || !knownPolda || (expanding && !confirmed)) return;
    void onSave(user, draft || null);
  };

  return (
    <tr className="border-t border-line">
      <td className="p-4 align-top">
        <p className="font-medium text-fg">{user.name}</p>
        <p className="mt-1 text-xs text-fg-muted">{user.email}</p>
        <p className="mt-1 text-xs text-fg-muted">{user.role?.name ?? 'Tanpa role'}{user.is_blocked ? ' / Diblokir' : ''}</p>
      </td>
      <td className="p-4 align-top">
        <form onSubmit={submit} className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor={`polda-${user.id}`}>Cakupan Propam untuk {user.name}</label>
            <select id={`polda-${user.id}`} className={`${CONTROL} min-w-56 flex-1`}
              disabled={busy} value={draft}
              onChange={(event) => { setDraft(event.target.value); setConfirmed(false); }}>
              <option value="">Nasional - semua Polda dalam akses topik</option>
              {!knownPolda && <option value={draft} disabled>Kode Polda tidak dikenali: {draft}</option>}
              {options.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
            </select>
            <button type="submit" className={BUTTON} disabled={busy || !changed || !knownPolda || (expanding && !confirmed)}
              aria-label={`Simpan cakupan ${user.name}`} aria-busy={saving}>
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {saving ? 'Menyimpan' : 'Simpan'}
            </button>
          </div>
          {expanding && (
            <label className="flex items-start gap-2 text-xs text-fg-muted">
              <input type="checkbox" className="mt-0.5 accent-brand" checked={confirmed} disabled={busy}
                onChange={(event) => setConfirmed(event.target.checked)} />
              Saya memahami bahwa akun ini dapat melihat semua Polda yang termasuk akses topik/workspace-nya.
            </label>
          )}
        </form>
      </td>
    </tr>
  );
}

export function AccessSettingsView() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AccessUserPage | null>(null);
  const [options, setOptions] = useState<PoldaOption[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    propamAccessService.users(search, page, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setUsers(result.data);
          setOptions(result.meta.poldas);
        }
      })
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) setLoadError(errorMessage(error));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [search, page, retry]);

  const save = async (user: AccessUser, polda: string | null) => {
    setSavingId(user.id);
    setSaveError(null);
    setSuccess(null);
    try {
      const result = await propamAccessService.save(user.id, polda);
      setUsers((current) => current ? {
        ...current,
        data: current.data.map((item) => item.id === user.id ? { ...item, polda: result.data.polda } : item),
      } : current);
      setSuccess(`${user.name}: ${result.message}`);
      if (currentUser?.id === user.id) {
        window.dispatchEvent(new Event(PROPAM_ACCESS_CHANGED));
      }
    } catch (error) {
      setSaveError(`${user.name}: ${errorMessage(error)}`);
    } finally {
      setSavingId(null);
    }
  };

  const busy = loading || savingId !== null;

  return (
    <PropamPage title="Pengaturan Akses" subtitle="Tetapkan cakupan Polda per user, khusus modul Propam." icon={ShieldCheck}>
      <aside className="space-y-2 rounded-xl border border-line bg-muted p-4 text-sm text-fg-muted">
        <p className="flex items-center gap-2 font-semibold text-fg"><Globe className="size-4" aria-hidden="true" /> Workspace tetap global</p>
        <p>Penugasan ini tidak mengubah role, workspace, atau akses analisis umum. Nasional berarti semua Polda dalam akses topik yang dimiliki user, bukan akses ke seluruh workspace.</p>
        <p>Hanya Operator yang dapat mengelola halaman ini. Daftar dan perubahan dibatasi pada user di workspace Propam Polri; cakupannya dapat diatur menjadi satu Polda atau Nasional.</p>
        <p>Penugasan satu Polda membatasi Radar, Dumas, EWS, isu, ringkasan, serta preview dan laporan harian. Data tanpa atribusi wilayah tidak ditampilkan untuk akun tersebut.</p>
      </aside>
      <form className="flex flex-wrap gap-2" onSubmit={(event) => {
        event.preventDefault();
        if (!busy) { setSearch(searchInput.trim()); setPage(1); setSuccess(null); setSaveError(null); }
      }}>
        <label htmlFor="access-search" className="sr-only">Cari user berdasarkan nama atau email</label>
        <input id="access-search" type="search" maxLength={100} className={`${CONTROL} min-w-56 flex-1`}
          placeholder="Cari nama atau email user" value={searchInput} disabled={busy}
          onChange={(event) => setSearchInput(event.target.value)} />
        <button type="submit" className={BUTTON} disabled={busy}><Search className="size-4" aria-hidden="true" /> Cari</button>
      </form>
      {success && <p role="status" className="rounded-lg border border-line bg-muted p-3 text-sm text-fg">{success}</p>}
      {saveError && <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{saveError}</p>}
      {loadError ? <ErrorState message={loadError} onRetry={() => setRetry((value) => value + 1)} />
        : loading ? <LoadingState />
          : users && (users.data.length === 0 ? <EmptyState title="User tidak ditemukan" hint="Coba cari nama atau email lain." /> : (
            <section className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <caption className="sr-only">Cakupan akses Polda per user</caption>
                  <thead className="bg-muted text-fg-muted"><tr><th scope="col" className="p-4">User</th><th scope="col" className="p-4">Cakupan Propam</th></tr></thead>
                  <tbody>{users.data.map((user) => (
                    <AccessRow key={`${user.id}:${user.polda ?? 'national'}`} user={user} options={options}
                      busy={busy} saving={savingId === user.id} onSave={save} />
                  ))}</tbody>
                </table>
              </div>
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4 text-sm text-fg-muted">
                <span>{users.total} user / Halaman {users.current_page} dari {users.last_page}</span>
                <div className="flex gap-2">
                  <button type="button" className={BUTTON} disabled={busy || page <= 1}
                    onClick={() => setPage((value) => value - 1)}>Sebelumnya</button>
                  <button type="button" className={BUTTON} disabled={busy || page >= users.last_page}
                    onClick={() => setPage((value) => value + 1)}>Berikutnya</button>
                </div>
              </footer>
            </section>
          ))}
    </PropamPage>
  );
}
