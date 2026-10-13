# 🚀 Getting Started Guide

Panduan lengkap untuk memulai development dengan starterpack ini.

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah install:

- **Node.js** v20 atau lebih tinggi ([Download](https://nodejs.org/))
- **Yarn** atau **NPM** (Yarn recommended)
- **Code Editor** (VS Code recommended)

## 🔧 Setup Project

### 1. Clone/Download Project

```bash
# Jika dari git
git clone <your-repo-url>
cd react-admin-starterpack

# Atau download dan extract ZIP
```

### 2. Install Dependencies

```bash
# Menggunakan Yarn (recommended)
yarn install

# Atau menggunakan NPM
npm install
```

### 3. Start Development Server

```bash
yarn dev
# atau
npm run dev
```

Server akan berjalan di `http://localhost:5173`

## 📁 Struktur Project

```
superadmin/
├── public/              # Static assets
│   └── assets/         # Images, icons, illustrations
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context (Auth, dll)
│   ├── layouts/        # Layout templates
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── services/       # API service layer
│   ├── theme/          # Theme configuration
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
├── .eslintrc.js       # ESLint config
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── vite.config.ts     # Vite config
```

## 🎯 Workflow Development

### 1. Membuat Page Baru

**Step 1:** Buat file page di `src/pages/`

```typescript
// src/pages/my-new-page.tsx
import type { FC } from 'react';
import { Typography, Container } from '@mui/material';

export const MyNewPage: FC = () => {
  return (
    <Container>
      <Typography variant="h3">My New Page</Typography>
      <Typography variant="body1">Content here...</Typography>
    </Container>
  );
};
```

**Step 2:** Tambahkan route di `src/routes/sections.tsx`

```typescript
import { MyNewPage } from '../pages/my-new-page';

export const routesSection = [
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      // ... routes lainnya
      {
        path: 'my-page',
        element: <MyNewPage />
      },
    ],
  },
];
```

**Step 3:** Tambahkan menu di `src/layouts/nav-config-dashboard.tsx`

```typescript
export const navConfigDashboard = [
  // ... menu lainnya
  {
    title: 'My Page',
    path: '/my-page',
    icon: 'solar:home-2-bold-duotone',
  },
];
```

### 2. Membuat Component Reusable

```typescript
// src/components/my-component/my-component.tsx
import type { FC } from 'react';
import { Box } from '@mui/material';

type MyComponentProps = {
  title: string;
  description?: string;
};

export const MyComponent: FC<MyComponentProps> = ({ title, description }) => {
  return (
    <Box>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Box>
  );
};
```

```typescript
// src/components/my-component/index.ts
export * from './my-component';
```

### 3. Membuat API Service

```typescript
// src/services/myService.ts
import axios from 'axios';

const API_URL = 'https://api.example.com';

export const myService = {
  // GET data
  async getItems() {
    const response = await axios.get(`${API_URL}/items`);
    return response.data;
  },

  // POST data
  async createItem(data: any) {
    const response = await axios.post(`${API_URL}/items`, data);
    return response.data;
  },

  // PUT data
  async updateItem(id: string, data: any) {
    const response = await axios.put(`${API_URL}/items/${id}`, data);
    return response.data;
  },

  // DELETE data
  async deleteItem(id: string) {
    const response = await axios.delete(`${API_URL}/items/${id}`);
    return response.data;
  },
};
```

### 4. Menggunakan Service di Page

```typescript
import { useState, useEffect } from 'react';
import { myService } from '../services/myService';

export const MyPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await myService.getItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## 🎨 Kustomisasi Theme

Lihat [THEME_CUSTOMIZATION.md](./THEME_CUSTOMIZATION.md) untuk panduan lengkap kustomisasi theme.

Quick start:

1. Edit `src/theme/theme-config.ts`
2. Ubah warna di bagian `palette`
3. Save dan lihat perubahan secara real-time

## 🔐 Authentication Flow

Starterpack sudah include basic authentication context:

```typescript
// Login
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async () => {
    await login(username, password);
  };
}

// Logout
function LogoutButton() {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
}

// Check auth status
function ProtectedComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  return <div>Welcome {user.name}</div>;
}
```

## 📦 Build untuk Production

```bash
# Build
yarn build
# atau
npm run build

# Preview build
yarn start
# atau
npm run start
```

Output akan ada di folder `dist/`

## 🚀 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Manual Deploy

Upload folder `dist/` ke hosting static Anda (Apache, Nginx, dll)

## 🔍 Debugging

### VS Code Launch Configuration

Buat file `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### React DevTools

Install [React Developer Tools](https://react.dev/learn/react-developer-tools) browser extension.

## 📚 Resources & Documentation

- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🆘 Troubleshooting

### Port sudah digunakan

```bash
# Ubah port di vite.config.ts
server: {
  port: 3000  // Ganti port di sini
}
```

### Module not found

```bash
# Clear cache dan reinstall
yarn clean
yarn install
```

### TypeScript errors

```bash
# Check TypeScript
yarn tsc:watch
```

## 💡 Tips & Best Practices

1. **Component Naming**: Gunakan PascalCase untuk component
2. **File Organization**: Group by feature, bukan by type
3. **TypeScript**: Selalu define types untuk props dan state
4. **Code Style**: Gunakan ESLint dan Prettier
5. **Git Commits**: Gunakan conventional commits
6. **Performance**: Gunakan React.memo untuk expensive components
7. **Lazy Loading**: Import pages dengan React.lazy()

## 🎓 Next Steps

1. ✅ Setup project
2. ✅ Kustomisasi theme
3. ✅ Buat page pertama
4. ✅ Setup API services
5. ✅ Deploy ke production

---

**Happy coding! 🚀**

Jika ada pertanyaan, silakan buka issue atau hubungi maintainer.
