# React Admin Starterpack

![license](https://img.shields.io/badge/license-MIT-blue.svg)

> Starterpack untuk membangun Admin Dashboard dengan Material-UI, React, Vite.js, dan TypeScript.

## ✨ Fitur

- ⚡️ **Vite** - Build tool yang sangat cepat
- ⚛️ **React 19** - Library UI terbaru
- 🎨 **Material-UI v7** - Component library yang lengkap
- 📘 **TypeScript** - Type safety untuk code yang lebih robust
- 🎯 **React Router v7** - Routing modern dengan loader support
- 🌗 **Dark/Light Mode** - Theme switcher built-in
- 🔐 **Authentication** - Context-based auth system
- 📊 **Charts** - ApexCharts terintegrasi
- 🎨 **Customizable Theme** - Mudah disesuaikan dengan brand Anda

## 🚀 Quick Start

### Requirements

- Node.js v20.x atau lebih tinggi
- Yarn atau NPM

### Installation

```bash
# Install dependencies
yarn install
# atau
npm install

# Start development server
yarn dev
# atau
npm run dev

# Open browser
http://localhost:5173
```

### Build untuk Production

```bash
yarn build
# atau
npm run build
```

## 📁 Struktur Project

```
src/
├── components/          # Reusable components
│   ├── chart/          # Chart components
│   ├── iconify/        # Icon components
│   ├── logo/           # Logo components
│   └── ...
├── contexts/           # React contexts (Auth, dll)
├── layouts/            # Layout components
│   ├── auth/          # Auth layout
│   └── dashboard/     # Dashboard layout
├── pages/             # Page components
├── routes/            # Route configurations
├── services/          # API services
├── theme/             # Theme configuration
│   ├── theme-config.ts    # Customize theme di sini
│   └── core/              # Theme core
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## 🎨 Kustomisasi Theme

Edit file `src/theme/theme-config.ts` untuk mengubah:

- Warna palette (primary, secondary, dll)
- Font family
- CSS variables

```typescript
export const themeConfig: ThemeConfig = {
  palette: {
    primary: {
      main: '#1877F2', // Ubah warna primary di sini
      // ...
    },
    // ...
  },
  fontFamily: {
    primary: 'DM Sans Variable', // Ubah font di sini
    secondary: 'Barlow',
  },
};
```

## 🔧 Available Scripts

```bash
yarn dev              # Start development server
yarn build            # Build untuk production
yarn start            # Preview production build
yarn clean            # Hapus node_modules dan build files
yarn re:dev           # Clean install dan dev
yarn re:build         # Clean install dan build
yarn tsc:watch        # TypeScript watch mode
```

## 📦 Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 6
- **UI Library:** Material-UI v7
- **Language:** TypeScript 5
- **Routing:** React Router v7
- **Charts:** ApexCharts
- **HTTP Client:** Axios
- **Date:** Day.js
- **Styling:** Emotion

## 🛠️ Cara Menggunakan

1. **Clone atau download starterpack ini**
2. **Install dependencies** dengan `yarn install` atau `npm install`
3. **Kustomisasi theme** di `src/theme/theme-config.ts`
4. **Buat pages baru** di folder `src/pages/`
5. **Tambah routes** di `src/routes/sections.tsx`
6. **Setup API services** di `src/services/`
7. **Deploy** ke platform pilihan Anda

## 📝 License

Distributed under the MIT license.

## 💡 Tips

- Gunakan `src/components/` untuk component yang reusable
- Simpan business logic di `src/services/`
- Definisikan types di `src/types/`
- Gunakan theme system untuk konsistensi styling
- Manfaatkan React Router loaders untuk data fetching

---

**Happy Coding! 🚀**
# sentiment-propam
# Pengaturan Akses Propam

Menu **Account -> Pengaturan Akses** (`/propam/access-settings`), di bawah
Profile dan Pengaturan Report, tersedia hanya
untuk Operator, bukan Super Admin. Cari user, pilih cakupan nasional atau satu Polda, kemudian
klik **Simpan**. Perluasan ke nasional membutuhkan konfirmasi. Workspace dan
role user tidak diubah. Nasional tetap mengikuti akses topik/workspace user.

Backend harus menyediakan `GET /api/v1/propam/access-settings` (daftar user dan
katalog Polda) serta `PUT /api/v1/propam/access-settings/users/{id}` (penugasan).
Pembatasan diterapkan oleh backend pada analisis Propam dan laporan; halaman ini
bukan sekadar filter tampilan. Beberapa Polda per akun belum didukung.
Operator dapat mengatur user semua role hanya di workspace **Propam Polri**, termasuk
akun sendiri dan akun Super Admin jika berada di workspace tersebut. User workspace
lain atau tanpa workspace tidak ditampilkan dan tidak dapat diubah melalui API ini.
Operator pengelola tidak harus berasal dari workspace Propam Polri.
Operator boleh melepas penugasan Polda menjadi nasional;
karena itu, penugasan Polda tidak merupakan batas permanen bagi pengelola Operator.

Menu **Topics Settings** berada di grup **Data Management**. URL dan hak akses
halaman tidak berubah setelah penataan sidebar.

Judul grup analisis mengikuti cakupan akun dari `/v1/propam/polda/options`:
**Polda Jawa Barat - EWS Paminal**, misalnya, atau **Nasional - EWS Paminal**
untuk akun tanpa penugasan Polda. Nama tidak diambil dari topik/workspace.
Judul diperbarui saat penugasan akun sendiri disimpan atau jendela mendapat fokus.
Paminal berarti Pengamanan Internal; EWS berarti sistem peringatan dini.

## Panduan penggunaan dan HTML offline

Menu **Account -> Panduan Penggunaan** (`/panduan`) berisi petunjuk per halaman,
langkah penggunaan, arti indikator, batasan, screenshot, glosarium, dan
penanganan masalah umum. Halaman demo/legacy diberi keterangan yang jelas.
Halaman Settings lama (`/settings`) tidak disertakan karena tidak digunakan di Propam.
Screenshot diambil pada 7 Oktober 2026; identitas akun dan tujuan laporan
disamarkan. File tetap untuk penggunaan internal dan perlu ditinjau sebelum dibagikan.

```sh
npm run check:guide
npm run build
npm run build:guide
```

Urutannya penting: build aplikasi terlebih dahulu, kemudian build panduan.
Build aplikasi membersihkan `dist`; build panduan menambahkan `dist/panduan-offline.html`
untuk tombol unduh. File mandiri `docs/panduan-penggunaan.html` menyertakan
JavaScript, CSS, dan gambar sehingga dapat dibuka offline tanpa server/CDN.
Panduan tidak mengambil data API atau menyertakan credential.

Konten dipelihara di `src/sections/user-guide/guide-data.ts`; screenshot di
`docs/screenshots`. `npm run check:guide` memastikan seluruh route/sidebar
terdokumentasi dan screenshot tidak hilang. Panduan dapat dicari, difilter per
kelompok, dan dicetak/disimpan PDF. Tombol cetak menyertakan seluruh halaman.
# densus88-anti-teror
