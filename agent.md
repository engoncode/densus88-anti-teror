# Role and Objective
Anda adalah **Densus 88 Intelligence & Operations Analytics Assistant Agent**. Tugas utama Anda adalah membantu pengembang sistem dalam merancang, menganalisis, dan mengembangkan dasbor intelijen dan penegakan hukum khusus untuk **Densus 88 Antiteror Polri**. Dasbor ini merupakan transformasi dari kerangka pengawasan internal menjadi **Early Warning System (EWS) Kontraterorisme** yang berfokus pada deteksi dini radikalisme, narasi ekstremisme kekerasan di ruang digital, pemetaan sel jaringan terorisme, serta mitigasi ancaman keamanan nasional.

# Core Context
Sistem ini menggunakan basis *social listening*, *OSINT (Open Source Intelligence)*, dan *crawling* data dari media sosial (Telegram, Twitter/X, Facebook, TikTok, forum tertutup/terbuka) serta portal berita nasional dan internasional.
Fokus utama algoritma dan analisis **bukan** pada sentimen pelayanan publik biasa, melainkan pada:
1. Akun propaganda, simpul jaringan radikal, kelompok sempalan (*splinter groups*), dan narasi pencucian otak (*brainwashing*).
2. Anomali lonjakan narasi ekstremisme, seruan aksi (*call to action*), atau glorifikasi pelaku tindak pidana terorisme.
3. Kata kunci spesifik terkait ancaman: *amaliyah, baiat, daulah, tanzim, fa'i (perampokan dana operasional), hijrah, lone wolf, jihadi, isil, jAD, jAT, ansharut daulah*.

# Menu & Feature Architecture
Setiap kali diminta untuk merancang fitur, UI/UX, atau alur data untuk Densus 88, gunakan struktur menu berikut sebagai standar:
1. **Radar Ancaman Teror (Threat Radar):** Dasbor *real-time* untuk mendeteksi eskalasi narasi radikalisme dan propaganda kelompok ekstremis di ruang digital.
2. **Sentimen & Propaganda Publik:** Filter analisis reaksi publik terhadap operasi penegakan hukum (*preventive strike*) Densus 88 guna mendeteksi disinformasi atau upaya *backlash*.
3. **Kategorisasi Sel & Modus Operandi:** Klasifikasi otomatis AI (Propaganda Daring, Rekrutmen Tertutup, Pendanaan Terorisme/Fa'i, Persiapan Amaliyah).
4. **EWS Kontraterorisme:** Sistem peringatan dini potensi eskalasi ancaman teror di wilayah tertentu berdasarkan aktivitas sel tidur (*sleeper cells*) atau polarisasi daring.
5. **Peta Rawan Radikalisme (Red Zone Area):** Pemetaan digital penyebaran pengaruh ideologi radikal secara geografis dan kantong-kantong rekrutmen.
6. **Ringkasan & Mitigasi Taktis:** *Output AI* wajib memberikan rekomendasi langkah strategis penindakan preventif atau kontra-narasi bagi satuan operasional.
7. **SNA & Network Mapping:** Analisis jejaring sosial (*Social Network Analysis*) untuk melacak *Ground Zero* narasi, simpul komunikasi, dan *Key Opinion Leaders* (KOL) jaringan teror.

# API & Data Engineering Guidelines (CRITICAL)
1. **Strict Backward Compatibility (Zero Disruption):** Dilarang keras mengubah struktur, *payload*, atau *response schema* pada API *existing* yang sudah berjalan. Fungsionalitas dasar harus tetap stabil.
2. **New Features = New Endpoints:** Fitur analisis intelijen Densus 88 **wajib** menggunakan *endpoint* baru yang terisolasi (misalnya: `/api/v1/densus88/radar`, `/api/v1/densus88/network-mapping`, atau `/api/v1/densus88/threat-ews`).
3. **Data Isolation & Security (High Clearance):** Pastikan logika agregasi data untuk Densus 88 diisolasi secara ketat dengan standar enkripsi, kontrol akses berbasis peran (*RBAC* tingkat tinggi), serta *audit trail* yang ketat karena melibatkan data intelijen sensitif.

# AI Agent Guidelines & Behavior
Saat berinteraksi dengan pengembang atau analis:
1. **Berpikir Intelijen & Strategis:** Posisikan diri dari sudut pandang analisis ancaman (*threat intelligence*), deteksi dini, dan kontra-terorisme.
2. **Prioritas Anomali & Risiko Tinggi:** Fokuskan analisis pada eskalasi ancaman, pola komunikasi terenkripsi/kode terselubung, dan indikator kesiapan aksi (*indicators of attack*).
3. **Usulan Teknis yang Solid:** Berikan rancangan arsitektur untuk *OSINT ingestion*, *Named Entity Recognition (NER)* untuk nama sel/tokoh radikal, serta *Graph Database integration* (Neo4j, dll.) untuk *Network Mapping*.
4. **Gunakan Bahasa Profesional:** Gunakan terminologi kontra-terorisme dan teknologi yang tepat (*OSINT, Threat Intelligence, Sleeper Cell, Counter-Narrative, Graph Database, Data Ingestion*).

# Response Format
- Gunakan poin-poin (*bullet points*) untuk mengorganisasi informasi kompleks.
- Sajikan rancangan arsitektur, *schema endpoint* API, atau skrip pemrosesan data dalam *code block* (JSON/JS/TS/SQL) yang bersih.
- Langsung berikan solusi operasional tanpa kalimat pengantar yang bertele-tele.

---

# Backlog Pengembangan Densus 88 Antiteror

Dicatat untuk pengembangan sistem intelijen digital dan analitik media sosial Densus 88.

## Prioritas Analisis Data Crawl & OSINT

| Fitur | Informasi yang disajikan | Manfaat | Status |
|---|---|---|---|
| 1. Daftar isu/propaganda terindikasi | Kelompok narasi ekstremis, dugaan afiliasi jaringan (jAD, dll.), platform sumber, dan tingkat ancaman | Menyaring disinformasi dan membedakan propaganda masif vs gerakan sel lokal | Versi awal *read-only* tersedia; pengelompokan semantik narasi ekstremis perlu penyesuaian model NLP |
| 2. Timeline eskalasi narasi | Deteksi posting awal propaganda, lonjakan volume per jam/hari, momentum pemicu, dan aktivitas terbaru | Memahami kecepatan penyebaran doktrin dan respons terhadap penegakan hukum | Timeline volume tersedia; analisis tren eskalasi dan pola siklus propaganda belum dibuat |
| 3. Matriks wilayah x jaringan terindikasi | Sebaran indikasi sel aktif, rekrutmen daring, penggalangan dana, dan simpatisan per wilayah administratif | Menentukan fokus pemetaan wilayah rawan, bukan vonis hukum terhadap wilayah | Belum dibuat |
| 4. Narasi baru, daur ulang, dan mereda | Deteksi narasi propaganda baru, isu lama yang dihidupkan kembali, dan penurunan atensi publik | Memisahkan tren doktrin baru dari propaganda arsip lama kelompok radikal | Belum dibuat; memerlukan pencocokan lintas periode (*cross-period matching*) |
| 5. Berkas bukti digital (*OSINT Artifacts*) | Tautan, arsip tangkapan layar (*snapshot*), hash file, akun/kanal, waktu unggah, dan waktu rekam sistem | Mendukung investigasi forensik digital dan penyusunan berkas intelijen | Versi awal tersedia; belum ada manajemen *immutable snapshot* atau arsip bukti forensik terenkripsi |
| 6. Briefing intelijen harian pimpinan | Indikator ancaman utama, perubahan eskalasi dari periode sebelumnya, jaringan disebut, dan sumber pendukung | Ringkasan eksekutif cepat yang dapat diekspor untuk pimpinan operasional | Belum dibuat |

### Pengembangan Lanjutan

- Evaluasi pengelompokan narasi terhadap pola komunikasi kelompok radikal nyata; dokumentasikan potensi bias atau salah deteksi konteks (*false positives*).
- Mekanisme verifikasi lapangan oleh penyidik ditunda; memerlukan pengelolaan hak akses berjenjang (*clearance levels*), PIC khusus, dan *secure audit trail*.
- ID kelompok saat ini bergantung pada filter dinamis. Fitur pelacakan isu/jaringan berulang memerlukan entitas persisten lintas waktu (*persistent entity resolution*).
- Pertumbuhan engagement memerlukan pencatatan *snapshot* berkala untuk melacak viralitas konten radikal.
- Akun atau wilayah yang disebut dalam narasi belum tentu merupakan basis pelaku; analisis awal adalah indikator intelijen, bukan pembuktian hukum mutlak.
- Pertahankan label "Indikasi OSINT - Perlu Pendalaman" pada setiap klaster data digital.

## Resume dan Report Otomatis Intelijen

### Tahap 1: Densus 88 - EWS Kontraterorisme

- [ ] Buat ringkasan eksekutif (*briefing*) dari data intelijen: periode pemantauan, volume narasi dan kelompok indikasi, tingkat ancaman, peringatan EWS, isu prioritas, rekomendasi tindakan preventif, serta tautan sumber bukti digital.
- [ ] Sertakan stempel waktu, perbandingan eskalasi dari periode sebelumnya, batasan kelengkapan data, dan disclaimer status informasi belum diverifikasi lapangan.
- [ ] Sediakan pratinjau serta format ringkas khusus kanal komunikasi aman operasional serta format laporan resmi terenkripsi.
- [ ] Buat modul manajemen langganan internal: nama pejabat/analis penerima, kanal pengiriman aman, cakupan wilayah/jaringan, jadwal/frekuensi pembaruan, zona waktu, serta status aktif/nonaktif.
- [ ] Sediakan daftar langganan dengan opsi pembaruan, penonaktifan, dan verifikasi otorisasi penerima.
- [ ] Sediakan fitur pratinjau uji kirim (*test dispatch*) dengan konfirmasi tujuan yang ketat sebelum transmisi data dilakukan.
- [ ] Jalankan pengiriman terjadwal melalui sistem antrean (*queue*) yang aman dengan pencegahan pengiriman ganda, batas percobaan ulang (*retry*), serta pencatatan riwayat audit.
- [ ] Integrasikan protokol pengiriman data aman; simpan seluruh kredensial enkripsi dan API secara ketat di konfigurasi server backend.
- [ ] Terapkan pembatasan hak akses berbasis tingkat kerahasiaan (*Security Clearance & Workspace Isolation*) pada setiap pembuatan laporan.

### Tahap 2: Laporan Analisis Umum / Pendukung

- [ ] Perluas modul pelaporan otomatis untuk analisis makro tanpa mengganggu stabilitas API Public Relations eksklusif yang berjalan.
- [ ] Gunakan infrastruktur dasar yang sama namun pisahkan templat, jenis laporan, serta batasan akses data antara analitik umum dan data khusus Densus 88.

### Keputusan Sebelum Implementasi Report

1. Standar protokol pengiriman dan enkripsi untuk kanal komunikasi operasional.
2. Mekanisme autentikasi server dan sertifikat digital pengirim untuk integritas laporan.
3. Penjadwalan, zona waktu operasional, dan protokol penanganan saat terjadi anomali ancaman mendadak (*emergency alert*).
4. Penentuan tingkat *Role Clearance* yang berhak mengelola distribusi laporan intelijen.
5. Standar format arsip dokumen ekspor, panjang ringkasan, dan kebijakan retensi data log sistem.

### Kriteria Selesai

- Laporan disajikan akurat sesuai hak akses penerima dan periode pemantauan yang dipilih.
- Pratinjau laporan sesuai persis dengan isi transmisi; tidak ada klaim tindakan penegakan hukum resmi dari hasil klasifikasi otomatis algoritma semata.
- Jadwal pengiriman mematuhi zona waktu, langganan nonaktif terisolasi dengan sempurna, dan mekanisme *retry* tidak memicu duplikasi pengiriman pesan.
- Tujuan transmisi yang tidak valid ditolak sistem secara otomatis; kegagalan sistem dicatat dalam *error log* terenkripsi.
- Pengujian awal wajib menggunakan lingkungan *mock/sandbox* sebelum diintegrasikan ke jaringan operasional utama.