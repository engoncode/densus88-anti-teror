import type { FormEvent } from 'react';
import type { ReportSettings, ReportSettingsInput } from 'src/services/reportSettingsService';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { Mail, Save, MessageCircle, Settings2, LoaderCircle } from 'lucide-react';

import { reportSettingsService } from 'src/services/reportSettingsService';

import { PropamPage } from '../components/propam-page';
import { ReportPreviewCard } from '../components/report-preview-card';
import { ErrorState, LoadingState } from '../components/states';

const INPUT = 'mt-2 block w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-brand';

function errorMessage(error: unknown): string {
  return axios.isAxiosError<{ message?: string }>(error) && error.response?.data.message
    ? error.response.data.message : 'Gagal menghubungi API pengaturan report.';
}

export function ReportSettingsView() {
  const [settings, setSettings] = useState<ReportSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    reportSettingsService.get(controller.signal)
      .then((data) => { if (!controller.signal.aborted) setSettings(data); })
      .catch((error) => {
        if (!axios.isCancel(error)) setLoadError(errorMessage(error));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);

  const change = (next: Partial<ReportSettingsInput>) => {
    setSettings((current) => current ? { ...current, ...next } : current);
    setSuccess(null);
    setSaveError(null);
    setFieldErrors({});
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings || saving) return;
    setSaving(true);
    setSuccess(null);
    setSaveError(null);
    setFieldErrors({});
    try {
      const result = await reportSettingsService.save({
        whatsapp_enabled: settings.whatsapp_enabled,
        whatsapp_number: settings.whatsapp_number?.trim() || null,
        email_enabled: settings.email_enabled,
        email_source: settings.email_source,
        custom_email: settings.email_source === 'custom' ? settings.custom_email?.trim() || null : null,
      });
      setSettings(result.data);
      setSuccess(result.message);
    } catch (error) {
      setSaveError(errorMessage(error));
      if (axios.isAxiosError<{ errors?: Record<string, string[]> }>(error)) {
        setFieldErrors(error.response?.data.errors ?? {});
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PropamPage title="Pengaturan Laporan" subtitle="Simpan pilihan kanal dan tujuan laporan untuk akun Anda." icon={Settings2}>
      <aside className="rounded-xl border border-line bg-muted p-4 text-sm leading-relaxed text-fg-muted">
        <strong className="text-fg">Laporan dikirim otomatis setiap hari pukul {settings?.schedule_time ?? '08:00'} WIB</strong> ke
        kanal yang ON, berisi ringkasan 24 jam terakhir seperti preview di bawah. Menyimpan pengaturan tidak langsung mengirim pesan.
      </aside>
      {loadError ? <ErrorState message={loadError} onRetry={() => setRetry((value) => value + 1)} /> : loading ? <LoadingState /> : settings && (
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={saving} className="m-0 min-w-0 space-y-4 border-0 p-0">
            <section className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
                  <MessageCircle className="size-5" strokeWidth={1.5} aria-hidden="true" /> WhatsApp
                </h2>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                  <input type="checkbox" role="switch" className="size-4 accent-brand"
                    checked={settings.whatsapp_enabled} onChange={(e) => change({ whatsapp_enabled: e.target.checked })}
                    aria-label="Aktifkan report WhatsApp" />
                  {settings.whatsapp_enabled ? 'ON' : 'OFF'}
                </label>
              </div>
              <label className="mt-4 block text-sm text-fg">
                Nomor WhatsApp
                <input type="tel" autoComplete="tel" className={INPUT} placeholder="+6281234567890"
                  value={settings.whatsapp_number ?? ''} required={settings.whatsapp_enabled}
                  pattern="\+?[1-9][0-9]{7,14}" maxLength={16} aria-describedby="wa-hint wa-error"
                  aria-invalid={!!fieldErrors.whatsapp_number}
                  onChange={(e) => change({ whatsapp_number: e.target.value })} />
              </label>
              <p id="wa-hint" className="text-xs text-fg-muted">Gunakan kode negara, contoh +6281234567890, tanpa spasi atau tanda hubung. Nomor dapat disimpan saat OFF. Grup belum didukung pada tahap ini.</p>
              <p id="wa-error" className="text-xs text-danger">{fieldErrors.whatsapp_number?.join(' ')}</p>
            </section>
            <section className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
                  <Mail className="size-5" strokeWidth={1.5} aria-hidden="true" /> Email
                </h2>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                  <input type="checkbox" role="switch" className="size-4 accent-brand"
                    checked={settings.email_enabled} onChange={(e) => change({ email_enabled: e.target.checked })}
                    aria-label="Aktifkan report email" />
                  {settings.email_enabled ? 'ON' : 'OFF'}
                </label>
              </div>
              <fieldset className="mt-4 min-w-0 space-y-3 rounded-lg border border-line p-4">
                <legend className="px-1 text-sm text-fg">Email tujuan</legend>
                <label className="flex items-start gap-2 text-sm text-fg">
                  <input type="radio" name="email_source" value="account" className="mt-1 accent-brand"
                    checked={settings.email_source === 'account'}
                    onChange={() => change({ email_source: 'account', custom_email: null })} />
                  <span className="break-all">Email akun: {settings.account_email ?? 'Tidak tersedia'}</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-fg">
                  <input type="radio" name="email_source" value="custom" className="accent-brand"
                    checked={settings.email_source === 'custom'} onChange={() => change({ email_source: 'custom' })} />
                  Gunakan email berbeda
                </label>
                {settings.email_source === 'custom' && (
                  <label className="block text-sm text-fg">
                    Alamat email berbeda
                    <input type="email" autoComplete="email" className={INPUT} placeholder="report@example.com"
                      value={settings.custom_email ?? ''} required={settings.email_enabled} maxLength={254}
                      aria-invalid={!!fieldErrors.custom_email} aria-describedby="email-error"
                      onChange={(e) => change({ custom_email: e.target.value })} />
                  </label>
                )}
                <p id="email-error" className="text-xs text-danger">
                  {fieldErrors.custom_email?.join(' ')} {fieldErrors.email_source?.join(' ')}
                </p>
              </fieldset>
              <p className="text-xs text-fg-muted">Email akun mengikuti alamat terbaru pada akun Anda. Email berbeda hanya menjadi tujuan report dan tidak mengubah email login.</p>
            </section>
          </fieldset>
          <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
            {saveError && <p role="alert" className="text-sm text-danger sm:mr-auto">{saveError}</p>}
            {success && <p role="status" className="text-sm text-fg-muted sm:mr-auto">{success}</p>}
            <button type="submit" disabled={saving}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-fg px-4 py-2 text-sm font-semibold text-surface hover:opacity-80 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
              {saving ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" strokeWidth={1.5} aria-hidden="true" />}
              {saving ? 'Menyimpan...' : 'Simpan pengaturan'}
            </button>
          </div>
        </form>
      )}
      <ReportPreviewCard />
    </PropamPage>
  );
}
