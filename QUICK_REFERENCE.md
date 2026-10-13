# 📋 Quick Reference

Cheat sheet untuk development dengan starterpack ini.

## 🚀 Commands

```bash
# Development
yarn dev              # Start dev server (http://localhost:5173)
yarn build           # Build for production
yarn start           # Preview production build

# Maintenance
yarn clean           # Remove node_modules and build folders
yarn re:dev          # Clean reinstall and dev
yarn re:build        # Clean reinstall and build

# TypeScript
yarn tsc:watch       # Watch mode for type checking
yarn tsc:print       # Show TypeScript configuration
```

## 📁 Important Files

| File                                   | Purpose                                 |
| -------------------------------------- | --------------------------------------- |
| `src/theme/theme-config.ts`            | **Theme customization (colors, fonts)** |
| `src/routes/sections.tsx`              | Route configuration                     |
| `src/layouts/nav-config-dashboard.tsx` | Dashboard menu configuration            |
| `src/contexts/AuthContext.tsx`         | Authentication logic                    |
| `src/services/api.ts`                  | API client configuration                |
| `.env.example`                         | Environment variables template          |
| `vite.config.ts`                       | Vite configuration                      |

## 🎨 Theme Customization Quick Guide

```typescript
// src/theme/theme-config.ts
export const themeConfig = {
  palette: {
    primary: {
      main: '#1877F2', // Change this!
    },
    secondary: {
      main: '#8E33FF', // And this!
    },
  },
  fontFamily: {
    primary: 'DM Sans Variable', // Change font here
  },
};
```

## 📄 Create New Page - Step by Step

### 1. Create Page Component

```typescript
// src/pages/my-page.tsx
import { Container, Typography } from '@mui/material';

export function MyPage() {
  return (
    <Container>
      <Typography variant="h3">My Page</Typography>
    </Container>
  );
}
```

### 2. Add Route

```typescript
// src/routes/sections.tsx
import { MyPage } from '../pages/my-page';

// Add to children array
{ path: 'my-page', element: <MyPage /> }
```

### 3. Add Menu Item

```typescript
// src/layouts/nav-config-dashboard.tsx
{
  title: 'My Page',
  path: '/my-page',
  icon: 'solar:home-bold-duotone',
}
```

## 🔧 Create API Service

```typescript
// src/services/myService.ts
import { apiClient } from './api';

export const myService = {
  async getAll() {
    const { data } = await apiClient.get('/items');
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/items/${id}`);
    return data;
  },

  async create(payload: any) {
    const { data } = await apiClient.post('/items', payload);
    return data;
  },

  async update(id: string, payload: any) {
    const { data } = await apiClient.put(`/items/${id}`, payload);
    return data;
  },

  async delete(id: string) {
    const { data } = await apiClient.delete(`/items/${id}`);
    return data;
  },
};
```

## 🎯 Common MUI Components

```tsx
import {
  Box, // Container div with sx prop
  Container, // Max-width container
  Stack, // Flexbox container
  Grid, // Grid layout
  Card, // Card component
  CardContent, // Card content wrapper
  Button, // Button
  TextField, // Input field
  Typography, // Text component
  IconButton, // Icon button
  Avatar, // Avatar/profile picture
  Chip, // Badge/tag
  Dialog, // Modal dialog
  Menu, // Dropdown menu
  Table, // Table
  Tabs, // Tab navigation
} from '@mui/material';
```

## 🔐 Authentication Usage

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Check if user is logged in
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  // Access user data
  console.log(user.name);

  // Logout
  const handleLogout = () => {
    logout();
  };

  return <div>Welcome {user.name}</div>;
}
```

## 🎨 Using Icons

```tsx
import { Iconify } from '../components/iconify';

<Iconify icon="solar:home-bold-duotone" width={24} />;

// Find icons at: https://icon-sets.iconify.design/
```

## 🎨 Theming in Components

```tsx
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        color: theme.palette.primary.main,
        bgcolor: theme.palette.background.paper,
        p: theme.spacing(2),
        borderRadius: 2,
      }}
    >
      Content
    </Box>
  );
}
```

## 📊 MUI sx Prop Shortcuts

```tsx
<Box
  sx={{
    // Margin & Padding
    m: 2, // margin: theme.spacing(2)
    mt: 2, // marginTop
    mr: 2, // marginRight
    mb: 2, // marginBottom
    ml: 2, // marginLeft
    mx: 2, // marginLeft + marginRight
    my: 2, // marginTop + marginBottom
    p: 2, // padding
    pt: 2, // paddingTop
    // ... same pattern for padding

    // Width & Height
    width: 100, // 100px
    width: '100%', // 100%
    minWidth: 200,
    maxWidth: 400,
    height: 100,

    // Display & Flex
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,

    // Colors
    color: 'primary.main',
    bgcolor: 'background.paper',
    borderColor: 'divider',

    // Border
    border: 1,
    borderRadius: 2,

    // Shadow
    boxShadow: 1,

    // Position
    position: 'relative',
    top: 0,
    left: 0,

    // Typography
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  }}
/>
```

## 🎯 TypeScript Types

```typescript
// Define types
type User = {
  id: string;
  name: string;
  email: string;
};

// Component props
type MyComponentProps = {
  title: string;
  onSubmit: () => void;
  optional?: string;
};

// Function types
type HandleClick = (id: string) => void;

// Utility types
type CreateUser = Omit<User, 'id'>;
type UpdateUser = Partial<User>;
type UserKeys = keyof User;
```

## 🔄 Common Hooks

```typescript
// State
const [value, setValue] = useState<string>('');

// Effect
useEffect(() => {
  // Code here runs after render
  return () => {
    // Cleanup
  };
}, [dependencies]);

// Ref
const ref = useRef<HTMLDivElement>(null);

// Memo
const memoValue = useMemo(() => expensiveCalc(), [dep]);

// Callback
const memoCallback = useCallback(() => {}, [dep]);

// Context
const value = useContext(MyContext);

// Custom hook
const { data, loading } = useMyCustomHook();
```

## 🌐 Environment Variables

```typescript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Must start with VITE_ prefix!
```

## 🎯 Responsive Design

```tsx
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

function MyComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        // Responsive values
        width: { xs: '100%', md: '50%' },
        padding: { xs: 2, md: 4 },
        display: { xs: 'block', md: 'flex' },
      }}
    >
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </Box>
  );
}
```

## 📚 Useful Links

- [Material-UI Docs](https://mui.com/material-ui/getting-started/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Iconify Icons](https://icon-sets.iconify.design/)
- [React Router Docs](https://reactrouter.com/)

## 🐛 Common Issues

### Port already in use

```bash
# Change port in vite.config.ts
server: { port: 3000 }
```

### Module not found

```bash
yarn clean && yarn install
```

### TypeScript errors

```bash
yarn tsc:watch  # Check errors in watch mode
```

### Build fails

```bash
# Clear cache
rm -rf node_modules dist .vite
yarn install
yarn build
```

---

**Keep this file open while developing! 📌**
