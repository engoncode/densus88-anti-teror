# 🎨 Panduan Kustomisasi Theme

Dokumen ini menjelaskan cara memodifikasi theme di starterpack ini.

## 📍 File Konfigurasi Theme

File utama untuk kustomisasi theme:

- `src/theme/theme-config.ts` - Konfigurasi warna, font, dan palette
- `src/theme/create-theme.ts` - Factory untuk membuat theme
- `src/theme/theme-provider.tsx` - Provider untuk theme context

## 🎨 Mengubah Warna (Color Palette)

Edit file `src/theme/theme-config.ts`:

```typescript
export const themeConfig: ThemeConfig = {
  palette: {
    primary: {
      lighter: '#D0ECFE',
      light: '#73BAFB',
      main: '#1877F2', // Warna utama primary
      dark: '#0C44AE',
      darker: '#042174',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#EFD6FF',
      light: '#C684FF',
      main: '#8E33FF', // Warna utama secondary
      dark: '#5119B7',
      darker: '#27097A',
      contrastText: '#FFFFFF',
    },
    // ... warna lainnya
  },
};
```

### Contoh: Mengubah ke Theme Hijau

```typescript
primary: {
  lighter: '#C8FAD6',
  light: '#5BE49B',
  main: '#00A76F',        // Hijau
  dark: '#007867',
  darker: '#004B50',
  contrastText: '#FFFFFF',
}
```

## 🔤 Mengubah Font

### 1. Install Font (jika custom)

```bash
yarn add @fontsource-variable/nama-font
# atau
npm install @fontsource-variable/nama-font
```

### 2. Import di `main.tsx`

```typescript
import '@fontsource-variable/inter';
```

### 3. Update `theme-config.ts`

```typescript
fontFamily: {
  primary: 'Inter Variable',
  secondary: 'Inter Variable',
}
```

## 🌓 Dark/Light Mode

Theme sudah mendukung dark/light mode secara otomatis. User bisa toggle lewat UI.

Untuk mengakses mode saat ini di component:

```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return <div>{isDark ? 'Dark Mode' : 'Light Mode'}</div>;
}
```

## 🎯 CSS Variables

Theme menggunakan CSS variables yang bisa diakses di CSS:

```css
.my-class {
  color: var(--palette-primary-main);
  font-family: var(--font-family-primary);
}
```

## 🔧 Kustomisasi Component MUI

Untuk override default styling MUI components, edit `src/theme/core/components/`:

Contoh override Button:

```typescript
// src/theme/core/components/button.tsx
import type { Theme } from '@mui/material/styles';

export function button(theme: Theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Rounded corner
          textTransform: 'none', // No uppercase
        },
      },
    },
  };
}
```

## 📏 Breakpoints & Responsive

Default breakpoints:

- xs: 0px
- sm: 600px
- md: 900px
- lg: 1200px
- xl: 1536px

Untuk custom breakpoints, edit `src/theme/create-theme.ts`:

```typescript
breakpoints: {
  values: {
    xs: 0,
    sm: 600,
    md: 960,    // Custom
    lg: 1280,   // Custom
    xl: 1920,   // Custom
  }
}
```

## 🎭 Shadows & Elevation

Customize shadows di `src/theme/core/shadows.ts`.

## 📐 Spacing

Default spacing unit adalah 8px.

- `theme.spacing(1)` = 8px
- `theme.spacing(2)` = 16px
- `theme.spacing(3)` = 24px

## 🚀 Tips & Best Practices

1. **Konsistensi Warna**: Gunakan palette yang sudah didefinisikan
2. **Typography**: Manfaatkan variant typography yang ada
3. **Spacing System**: Gunakan `theme.spacing()` untuk konsistensi
4. **Responsive**: Gunakan breakpoints untuk design yang responsive
5. **Dark Mode**: Test theme di kedua mode (light & dark)

## 📚 Resources

- [Material-UI Theme Documentation](https://mui.com/material-ui/customization/theming/)
- [Color Palette Generator](https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors)
- [Google Fonts](https://fonts.google.com/)

## 🎨 Contoh Theme Preset

### Theme Biru (Default)

```typescript
primary: {
  main: '#1877F2';
}
secondary: {
  main: '#8E33FF';
}
```

### Theme Hijau

```typescript
primary: {
  main: '#00A76F';
}
secondary: {
  main: '#00B8D9';
}
```

### Theme Merah

```typescript
primary: {
  main: '#FF5630';
}
secondary: {
  main: '#FFC107';
}
```

### Theme Ungu

```typescript
primary: {
  main: '#7635DC';
}
secondary: {
  main: '#FF6B93';
}
```

---

Selamat berkreasi dengan theme Anda! 🎉
