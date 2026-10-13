import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { BookOpen, ChevronUp, ExternalLink, FileDown, Image, List, Printer, Search, ShieldAlert, X } from 'lucide-react';

import { glossary, guideGroups, guidePages, troubleshooting } from './guide-data';

import type { GuidePage } from './guide-data';

const screenshots = import.meta.glob<string>('../../../docs/screenshots/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';

function screenshotUrl(name?: string) {
  return name ? screenshots[`../../../docs/screenshots/${name}.png`] : undefined;
}

function GuideArticle({ entry, online }: { entry: GuidePage; online: boolean }) {
  const image = screenshotUrl(entry.screenshot);
  const [imageFailed, setImageFailed] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <article id={entry.id} className="scroll-mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 print:break-before-page print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="space-y-2">
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-blue-700">{entry.group}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="m-0 text-xl font-bold text-slate-950">{entry.title}</h3>
          {online && (
            <a href={entry.path} className={`${BUTTON} print:hidden`} target="_blank" rel="noopener noreferrer">
              Buka halaman <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
        <p className="m-0 text-sm text-slate-500">{entry.navigation}</p>
        <p className="m-0 text-sm text-slate-500">Alamat: <code className="break-all text-slate-700">{entry.path}</code></p>
        {entry.aliases && <p className="m-0 text-xs text-slate-500">Alamat lain: {entry.aliases.join(', ')}</p>}
        <p className="m-0 text-base leading-relaxed text-slate-700">{entry.purpose}</p>
      </header>
      <section aria-label={`Cara menggunakan ${entry.title}`}>
        <h4 className="mb-3 mt-0 text-base font-bold text-slate-900">Cara pakai</h4>
        <ol className="m-0 list-decimal space-y-2 pl-6 text-sm leading-relaxed text-slate-700">
          {entry.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>
      {entry.indicators.length > 0 && (
        <section aria-label={`Indikator ${entry.title}`}>
          <h4 className="mb-3 mt-0 text-base font-bold text-slate-900">Cara membaca hasil</h4>
          <dl className="m-0 grid gap-3 sm:grid-cols-2">
            {entry.indicators.map((indicator) => (
              <div key={indicator.label} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm font-semibold text-slate-900">{indicator.label}</dt>
                <dd className="m-0 mt-1 text-sm leading-relaxed text-slate-600">{indicator.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 print:break-inside-avoid">
        <h4 className="mb-2 mt-0 flex items-center gap-2 text-sm font-bold text-amber-950">
          <ShieldAlert className="size-4 shrink-0" aria-hidden="true" /> Perlu diperhatikan
        </h4>
        <ul className="m-0 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-amber-950">
          {entry.cautions.map((caution) => <li key={caution}>{caution}</li>)}
        </ul>
      </aside>
      {image && !imageFailed ? (
        <figure className="m-0 space-y-2 print:break-inside-avoid">
          <button type="button" aria-label={`Perbesar screenshot ${entry.title}`}
            onClick={() => { setEnlarged(true); dialog.current?.showModal(); }}
            className="block w-full cursor-zoom-in rounded-xl border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-blue-600">
            <img src={image} alt={`Screenshot halaman ${entry.title}, diambil dari aplikasi pada 7 Oktober 2026`}
              loading="lazy" className="block h-auto w-full rounded-xl border border-slate-200"
              onError={() => setImageFailed(true)} />
          </button>
          <figcaption className="text-xs leading-relaxed text-slate-500">
            Tampilan asli saat dokumentasi dibuat, bukan data contoh atau jaminan kondisi saat ini.
            {entry.screenshotNote ? ` ${entry.screenshotNote}` : ''} Klik gambar untuk memperbesar.
          </figcaption>
          <dialog ref={dialog} onClose={() => setEnlarged(false)} aria-label={`Screenshot ${entry.title}`}
            className="max-h-[95vh] w-[95vw] max-w-7xl rounded-xl border border-slate-300 bg-white p-4 shadow-xl backdrop:bg-slate-950/70 print:hidden">
            <form method="dialog" className="mb-3 flex items-center justify-between gap-3">
              <p className="m-0 text-sm font-semibold text-slate-900">{entry.title}</p>
              <button className={BUTTON} aria-label="Tutup screenshot"><X className="size-4" aria-hidden="true" /> Tutup</button>
            </form>
            {enlarged && <img src={image} alt={`Screenshot diperbesar: ${entry.title}`} className="h-auto w-full" />}
          </dialog>
        </figure>
      ) : (
        <p role={imageFailed ? 'alert' : undefined} className="m-0 flex items-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          <Image className="size-4 shrink-0" aria-hidden="true" />
          {imageFailed ? 'Screenshot gagal dimuat. Langkah penggunaan tetap tersedia di atas.' : 'Screenshot belum tersedia untuk halaman ini.'}
        </p>
      )}
      <a href="#guide-top" className="inline-flex items-center gap-1 text-xs text-blue-700 no-underline hover:underline print:hidden">
        <ChevronUp className="size-3" aria-hidden="true" /> Kembali ke daftar isi
      </a>
    </article>
  );
}

export function UserGuide() {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('Semua');
  const [notice, setNotice] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const offline = window.location.protocol === 'file:';

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Panduan Penggunaan - Densus 88 Antiteror & Analisis Sentimen';
    const beforePrint = () => setPrintMode(true);
    const afterPrint = () => setPrintMode(false);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      document.title = previousTitle;
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, []);

  const entries = useMemo(() => {
    if (printMode) return guidePages;
    const keyword = query.trim().toLocaleLowerCase('id');
    return guidePages.filter((entry) => (activeGroup === 'Semua' || entry.group === activeGroup)
      && JSON.stringify(entry).toLocaleLowerCase('id').includes(keyword));
  }, [query, activeGroup, printMode]);

  const grouped = guideGroups.map((group) => ({
    group,
    entries: entries.filter((entry) => entry.group === group),
  })).filter((group) => group.entries.length > 0);

  const print = async () => {
    setNotice('Saat dialog cetak terbuka, pilih Save as PDF untuk menyimpan panduan. Semua halaman akan disertakan.');
    flushSync(() => setPrintMode(true));
    await Promise.all(Array.from(document.images).map((image) => {
      image.loading = 'eager';
      return image.decode().catch(() => {
        setNotice('Ada gambar yang belum dapat dimuat untuk cetak. Teks panduan tetap tersedia; muat ulang jika membutuhkan seluruh screenshot.');
      });
    }));
    window.print();
    setPrintMode(false);
  };

  return (
    <div id="guide-top" className="min-h-screen bg-slate-50 font-sans text-slate-900 [--spacing:0.25rem] print:bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-6 space-y-4 rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="m-0 flex items-center gap-2 text-sm font-semibold text-blue-200"><BookOpen className="size-5" aria-hidden="true" /> Panduan pengguna</p>
          <h1 className="m-0 text-3xl font-bold leading-tight sm:text-4xl">Cara menggunakan web Densus 88 Antiteror</h1>
          <p className="m-0 max-w-3xl text-base leading-relaxed text-slate-300">
            Panduan seluruh halaman aktif, analisis umum, pengaturan akun, serta route tambahan yang masih berupa demo/legacy.
            Disusun dari kode dan tampilan aplikasi pada <strong className="text-white">7 Oktober 2026</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span>{guidePages.length} halaman</span><span>Screenshot asli, identitas akun disamarkan</span>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" className={BUTTON} onClick={() => { void print(); }}><Printer className="size-4" aria-hidden="true" /> Cetak / Simpan PDF</button>
            {!offline && <a href="/panduan-offline.html" download className={BUTTON}><FileDown className="size-4" aria-hidden="true" /> Unduh HTML offline</a>}
          </div>
          {notice && <p role="status" className="m-0 text-sm text-blue-200">{notice}</p>}
        </header>

        <section aria-labelledby="quick-start-title" className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 id="quick-start-title" className="mb-3 mt-0 text-lg font-bold">Mulai dalam lima langkah</h2>
          <ol className="m-0 list-decimal space-y-2 pl-6 text-sm leading-relaxed">
            <li>Login, periksa role/workspace, dan pilih topik dari header.</li>
            <li>Kelola keyword/platform/konteks melalui <a href="#topics-settings" className="text-blue-800">Topics Settings</a>. Tunggu data crawl tersedia.</li>
            <li>Baca Dashboard, Metrics, atau References untuk gambaran umum dan sumber konten.</li>
            <li>Untuk indikasi ancaman terorisme, gunakan Radar Ancaman Teror, Sentimen & Propaganda Publik, EWS Kontraterorisme, dan Isu & Bukti Digital. Verifikasi sumber sebelum tindak lanjut.</li>
            <li>Operator mengatur Polda user workspace Densus 88 melalui Pengaturan Akses; pengguna mengatur tujuan laporan melalui Pengaturan Report.</li>
          </ol>
          <p className="mb-0 mt-3 text-sm font-semibold text-blue-950">Data publik adalah sinyal awal, bukan bukti hukum, daftar kasus resmi, atau putusan terhadap seseorang/kelompok.</p>
        </section>

        <section aria-labelledby="scope-title" className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 id="scope-title" className="mb-3 mt-0 text-lg font-bold">Workspace, topik, dan Polda tidak sama</h2>
          <div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-3">
            <p className="m-0"><strong>Workspace:</strong> ruang akses topik. Tetap global dan tidak perlu dibuat ulang untuk setiap Polda.</p>
            <p className="m-0"><strong>Topik:</strong> keyword dan konteks pengumpulan/analisis. Semua topik berarti seluruh topik dalam akses Anda, bukan seluruh database.</p>
            <p className="m-0"><strong>Polda:</strong> penugasan akun untuk cakupan Densus 88. Nasional tidak melewati akses workspace/topik. Wilayah dikenali secara heuristik dari teks.</p>
          </div>
          <p className="mb-0 mt-3 text-sm text-slate-600">Judul sidebar mengikuti akun: nama Polda - EWS Kontraterorisme, atau Nasional - EWS Kontraterorisme. Pemilihan topik tidak mengubah hak akses Polda.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] print:block">
          <nav aria-label="Daftar isi panduan" className="self-start rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-4 print:hidden">
            <h2 className="mb-3 mt-0 flex items-center gap-2 text-base font-bold"><List className="size-4" aria-hidden="true" /> Daftar isi</h2>
            <label htmlFor="guide-search" className="mb-1 block text-xs font-semibold">Cari halaman atau istilah</label>
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-300 px-2">
              <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
              <input id="guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-900 outline-none"
                placeholder="Contoh: Polda, keyword..." />
            </div>
            <label htmlFor="guide-group" className="mb-1 block text-xs font-semibold">Kelompok halaman</label>
            <select id="guide-group" className="mb-3 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600"
              value={activeGroup} onChange={(event) => setActiveGroup(event.target.value)}>
              <option>Semua</option>{guideGroups.map((group) => <option key={group}>{group}</option>)}
            </select>
            <p role="status" className="mb-3 mt-0 text-xs text-slate-500">{entries.length} halaman ditemukan</p>
            <div className="max-h-[55vh] space-y-4 overflow-y-auto">
              {grouped.map(({ group, entries: pages }) => (
                <div key={group}>
                  <p className="mb-1 mt-0 text-xs font-bold uppercase text-slate-500">{group}</p>
                  <ul className="m-0 list-none space-y-1 p-0">
                    {pages.map((entry) => <li key={entry.id}><a href={`#${entry.id}`} className="block rounded-md px-2 py-1.5 text-sm text-slate-700 no-underline hover:bg-blue-50 hover:text-blue-800">{entry.title}</a></li>)}
                  </ul>
                </div>
              ))}
              <a href="#glossary" className="block text-sm text-blue-700">Glosarium</a>
              <a href="#troubleshooting" className="block text-sm text-blue-700">Masalah umum</a>
            </div>
          </nav>

          <div className="min-w-0 space-y-6">
            {entries.length === 0 ? (
              <section role="status" className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <h2 className="mt-0 text-lg font-semibold">Tidak ada halaman yang cocok</h2>
                <p className="text-sm text-slate-600">Coba istilah lain atau pilih kelompok Semua.</p>
                <button type="button" className={BUTTON} onClick={() => { setQuery(''); setActiveGroup('Semua'); }}>Reset pencarian</button>
              </section>
            ) : grouped.map(({ group, entries: pages }) => (
              <section key={group} aria-label={group} className="space-y-5">
                <h2 className="mb-0 mt-0 text-2xl font-bold print:hidden">{group}</h2>
                {pages.map((entry) => <GuideArticle key={entry.id} entry={entry} online={!offline} />)}
              </section>
            ))}

            <section id="glossary" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 print:break-before-page">
              <h2 className="mb-4 mt-0 text-xl font-bold">Glosarium</h2>
              <dl className="m-0 space-y-4">
                {glossary.map(({ term, definition }) => <div key={term}><dt className="font-semibold">{term}</dt><dd className="m-0 mt-1 text-sm leading-relaxed text-slate-600">{definition}</dd></div>)}
              </dl>
            </section>
            <section id="troubleshooting" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 print:break-before-page">
              <h2 className="mb-4 mt-0 text-xl font-bold">Masalah umum dan penanganannya</h2>
              <div className="space-y-4">
                {troubleshooting.map(({ problem, solution }) => <div key={problem}><h3 className="mb-1 mt-0 text-sm font-semibold">{problem}</h3><p className="m-0 text-sm leading-relaxed text-slate-600">{solution}</p></div>)}
              </div>
            </section>
            <footer className="text-xs leading-relaxed text-slate-500">
              Screenshot adalah rekaman tampilan pada saat dokumentasi dibuat. Data, menu, dan izin dapat berubah.
              Nilai identitas akun/tujuan pengiriman disamarkan; konten sumber publik yang terlihat tetap memerlukan verifikasi.
              Simpan panduan secara internal dan tinjau sebelum membagikannya.
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
