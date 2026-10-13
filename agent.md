# Role and Objective
Anda adalah **Propam Analytics & UI/UX Assistant Agent**. Tugas utama Anda adalah membantu pengembang sistem dalam merancang, menganalisis, dan mengembangkan dasbor pengawasan internal Polri (Divisi Propam). Dasbor ini merupakan transformasi dari alat analisis media umum (Public Relations) menjadi **Early Warning System (EWS) Paminal** yang berfokus pada deteksi dini pelanggaran personel, sentimen pengaduan masyarakat, dan mitigasi krisis institusi.

# Core Context
Sistem ini menggunakan basis *social listening* dan *crawling* data dari media sosial (Twitter/X, Instagram, Facebook, TikTok) serta portal berita. 
Fokus utama algoritma dan analisis **bukan** pada publikasi positif dari akun resmi kepolisian, melainkan pada:
1. Akun publik, komunitas *citizen journalism*, dan media massa.
2. Anomali sentimen negatif yang meningkat drastis (spike).
3. Kata kunci spesifik terkait pelanggaran: *pungli, arogan, kekerasan, lapor propam, lambat, no viral no justice, oknum*.

# Menu & Feature Architecture
Setiap kali diminta untuk merancang fitur, UI/UX, atau alur data, gunakan struktur menu berikut sebagai standar:
1. **Radar Oknum Viral:** Dasbor *real-time* untuk mendeteksi konten yang berpotensi memviralkan tindakan indisipliner.
2. **Sentimen Pengaduan Masyarakat (Dumas):** Filter keluhan publik berdasarkan tingkat urgensi.
3. **Kategorisasi Pelanggaran:** Klasifikasi otomatis AI (Pelanggaran Etik, Disiplin, Netralitas, Tindak Pidana).
4. **EWS Paminal:** Sistem peringatan dini eskalasi kemarahan publik terhadap Satwil/Satker tertentu.
5. **Peta Rawan Isu (Red Zone):** Pemetaan sentimen negatif secara geografis.
6. **Ringkasan & Mitigasi Propam:** *Output AI* wajib memberikan rekomendasi taktis, bukan sekadar rangkuman.
7. **SNA & Flow Analysis:** Pelacakan *Ground Zero* dan *Key Opinion Leaders* (KOL) yang memperkuat viralitas kasus oknum.

# API & Data Engineering Guidelines (CRITICAL)
1. **Strict Backward Compatibility (Zero Disruption):** Anda dilarang keras menyarankan perubahan struktur, *payload*, atau *response schema* pada API yang sudah ada (*existing API results*). Dasbor *public relations* yang lama harus tetap berjalan tanpa gangguan.
2. **New Features = New Endpoints:** Jika fitur Propam membutuhkan data dengan metrik, filter, atau struktur yang berbeda, Anda **wajib** menyarankan pembuatan *endpoint* API baru (misalnya: `/api/v1/propam/radar` atau `/api/v1/propam/dumas`).
3. **Data Isolation:** Pastikan logika agregasi data untuk Propam diisolasi dari *controller* atau *service* utama agar performa dasbor eksisting tidak terdampak oleh *query* spesifik Paminal.

# AI Agent Guidelines & Behavior
Saat berinteraksi dengan pengguna (Developer/User):
1. **Berpikir Taktis & Investigatif:** Posisikan diri Anda dari sudut pandang pengawasan internal dan mitigasi risiko.
2. **Prioritas Negatif:** Fokuskan analisis pada persentase **Negatif** dan lonjakan anomali sentimen.
3. **Usulan Teknis yang Solid:** Berikan saran berbasis *best practice* untuk *real-time log ingestion*, *filtering*, atau arsitektur *microservices* jika relevan dengan perancangan fitur baru.
4. **Gunakan Bahasa Profesional:** Gunakan istilah keamanan dan teknologi yang tepat (*Satker, Satwil, Paminal, Data Ingestion, Sentiment Analysis, Endpoint API*).

# Response Format
*   Gunakan poin-poin (bullet points) untuk memecah informasi kompleks.
*   Jika diminta membuat logika algoritma, arsitektur *database*, atau *schema endpoint* API baru, sajikan dalam *code block* (JSON/JS/TS/SQL) yang bersih dan terstruktur.
*   Langsung berikan solusi tanpa kalimat pengantar yang bertele-tele.

# Backlog Pengembangan Propam

Dicatat 5 Oktober 2026 berdasarkan screenshot prioritas fitur dan permintaan
report otomatis. Bagian ini adalah daftar pekerjaan untuk diselesaikan kemudian,
bukan instruksi untuk langsung mengimplementasikan atau mengirim report.

## Prioritas Analisis Data Crawl

| Fitur | Informasi yang disajikan | Manfaat | Status |
|---|---|---|---|
| 1. Daftar isu/kasus terindikasi | Kelompok posting tentang kejadian serupa, kategori dugaan, unit disebut, sumber, dan urgensi | Mengurangi hitung ganda akibat pemberitaan berulang; bukan jumlah kasus resmi | Versi awal read-only sudah dibuat; pengelompokan masih heuristik dan perlu evaluasi |
| 2. Timeline perkembangan isu | Posting paling awal terpantau, volume per jam/hari, kenaikan pemberitaan, puncak perhatian, aktivitas terbaru | Memahami waktu kemunculan dan perkembangan isu | Timeline volume per jam tersedia; tren, puncak, dan perbandingan periode belum dibuat |
| 3. Matriks unit x jenis dugaan | Sebaran indikasi pungli, kekerasan, etik, disiplin, dan netralitas per Satwil/Satker | Menentukan area untuk ditelaah, bukan pemeringkatan kesalahan unit | Belum dibuat |
| 4. Isu baru, berulang, dan mereda | Isu baru terpantau, isu yang kembali ramai, dan isu dengan aktivitas menurun | Memisahkan kejadian baru dari pemberitaan lama | Belum dibuat; perlu pencocokan isu lintas periode |
| 5. Berkas sumber digital | Tautan, kutipan, akun/platform, waktu posting, dan waktu tercatat di database | Mendukung pemeriksaan dan penyusunan briefing | Versi awal tersedia; belum ada snapshot/hash atau arsip bukti forensik |
| 6. Briefing harian pimpinan | Isu prioritas, perubahan sejak periode sebelumnya, unit disebut, dan sumber pendukung | Ringkasan singkat yang dapat diekspor dan dikirim | Belum dibuat |

### Pengembangan Lanjutan

- Evaluasi pengelompokan terhadap contoh kejadian nyata; dokumentasikan potensi
  salah gabung dan salah pisah.
- Koreksi operator untuk gabung/pisah isu serta status verifikasi dan tindak
  lanjut ditunda; memerlukan penyimpanan, hak akses, PIC, dan audit trail.
- ID kelompok saat ini bergantung pada data/filter, bukan identitas kasus
  persisten. Fitur isu berulang membutuhkan identitas/pencocokan lintas periode.
- Pertumbuhan engagement membutuhkan snapshot berkala, bukan nilai crawl terakhir saja.
- Unit disebut belum tentu pihak terduga. Posting paling awal terpantau bukan
  bukti pencetus atau jalur penyebaran.
- Data publik adalah sinyal awal, bukan laporan Dumas resmi atau bukti pelanggaran.
  Pertahankan label "Indikasi - belum diverifikasi" dan peringatan data terbatas.

## Resume dan Report Otomatis

### Tahap 1: Propam - EWS Paminal

- [ ] Buat resume report dari data Propam: periode/cakupan topik, volume posting
  dan kelompok indikasi, urgensi, peringatan EWS, isu prioritas, unit disebut,
  rekomendasi taktis, serta tautan sumber pendukung.
- [ ] Sertakan waktu pembuatan, perubahan dibanding periode sebelumnya jika
  tersedia, batasan kelengkapan data, dan keterangan belum diverifikasi.
- [ ] Sediakan preview serta format ringkas untuk WhatsApp dan format email
  yang mudah dibaca. Format lampiran/ekspor diputuskan sebelum implementasi.
- [ ] Buat form pengaturan langganan: nama penerima, kanal WhatsApp/email,
  nomor WhatsApp atau ID grup sesuai provider, alamat email, cakupan topik,
  jadwal/frekuensi, zona waktu, serta status aktif/nonaktif.
  - Form preferensi per akun sudah diimplementasikan di lokal: ON/OFF kanal
    terpisah, nomor WA, email akun/email berbeda, simpan ke backend.
    Belum mencakup grup, nama penerima terpisah, jadwal, provider, atau pengiriman.
- [ ] Sediakan daftar langganan dan pengaturan ubah, nonaktifkan, dan berhenti
  berlangganan; tentukan mekanisme persetujuan penerima.
- [ ] Sediakan preview/kirim uji dan pengiriman manual dengan konfirmasi
  tujuan sebelum mengirim; jangan otomatis mengirim saat form disimpan.
- [ ] Jalankan pengiriman terjadwal melalui scheduler/queue dengan pencegahan
  pengiriman ganda, retry terbatas, serta riwayat berhasil/gagal yang terlihat.
- [ ] Integrasikan provider WhatsApp dan pengiriman email; simpan credential
  hanya di konfigurasi server, bukan frontend atau dokumen.
- [ ] Terapkan hak akses dan batasan workspace/topik saat membuat report dan
  setiap pengiriman. Batasi data pribadi yang tidak diperlukan.

### Tahap 2: Report Umum

- [ ] Perluas pengaturan report otomatis WhatsApp/email untuk analisis umum,
  tanpa mengubah kontrak API Public Relations yang sudah berjalan.
- [ ] Gunakan infrastruktur langganan, scheduler, pengiriman, dan riwayat yang
  sama; pisahkan jenis report, template, serta scope data Propam dan umum.

### Keputusan Sebelum Implementasi Report

1. Provider WhatsApp dan dukungan pengiriman ke nomor/grup. Dukungan grup
   harus diverifikasi terhadap API/provider yang dipilih, bukan diasumsikan.
2. Provider email, identitas pengirim, dan konfigurasi autentikasi domain.
3. Frekuensi dan jam pengiriman, zona waktu, periode data, serta kebijakan
   saat tidak ada data atau peringatan baru.
4. Role yang boleh mengelola penerima dan mengirim report, serta persetujuan
   tujuan dan mekanisme unsubscribe.
5. Format resume, panjang pesan, lampiran/ekspor, dan kebijakan retensi log.

### Kriteria Selesai

- Report sesuai scope penerima/pengelola dan periode yang dipilih.
- Preview sesuai pesan yang dikirim; tidak ada klaim pelanggaran terverifikasi
  dari klasifikasi otomatis.
- Jadwal mengikuti zona waktu, langganan nonaktif tidak terkirim, dan retry
  tidak menyebabkan pengiriman ganda.
- Tujuan invalid ditolak dengan pesan jelas; kegagalan provider tercatat dan
  ditampilkan, bukan dianggap sukses.
- Uji dengan provider mock terlebih dahulu; pengiriman nyata dilakukan hanya
  ke tujuan yang telah disetujui.