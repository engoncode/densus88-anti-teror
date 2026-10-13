# 🏗️ Project Architecture

Dokumentasi arsitektur dan design pattern yang digunakan dalam starterpack ini.

## 📐 Arsitektur Overview

```
┌─────────────────────────────────────────────┐
│             User Interface (UI)             │
│         React Components & Pages            │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│          Presentation Layer                 │
│   - Pages (View)                            │
│   - Sections (Feature Components)           │
│   - Components (Reusable UI)                │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│           Business Logic Layer              │
│   - Contexts (State Management)             │
│   - Hooks (Custom Logic)                    │
│   - Utils (Helper Functions)                │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│            Data Access Layer                │
│   - Services (API Calls)                    │
│   - API Client (Axios)                      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│              External API                   │
│         Backend / Database                  │
└─────────────────────────────────────────────┘
```

## 📂 Folder Structure Detail

### `/src/components/`

**Purpose:** Komponen UI yang reusable dan generic

**Contoh:**

- `chart/` - Chart components (ApexCharts wrapper)
- `iconify/` - Icon component
- `logo/` - Logo component
- `label/` - Label/badge component
- `scrollbar/` - Custom scrollbar

**Best Practice:**

- Buat folder untuk setiap component
- Include `index.ts` untuk clean exports
- Pisahkan styles jika kompleks
- Tambahkan TypeScript types

```
components/
  my-component/
    my-component.tsx      # Main component
    my-component.types.ts # TypeScript types
    my-component.css      # Styles (optional)
    index.ts              # Exports
```

### `/src/pages/`

**Purpose:** Top-level page components yang di-render oleh router

**Characteristics:**

- One file = one route
- Import sections dan components
- Handle page-level state
- Setup page meta (title, dll)

**Example:**

```typescript
// src/pages/dashboard.tsx
import { Helmet } from 'react-helmet-async';
import { DashboardView } from '../sections/dashboard/view';

export function DashboardPage() {
  return (
    <>
      <Helmet>
        <title>Dashboard | Admin</title>
      </Helmet>
      <DashboardView />
    </>
  );
}
```

### `/src/sections/`

**Purpose:** Feature-specific components (complex business logic)

**Structure:**

```
sections/
  feature-name/
    components/        # Feature-specific components
    hooks/            # Feature-specific hooks
    view/             # Main view component
      feature-view.tsx
    feature-table.tsx
    feature-form.tsx
```

**Difference dari `/components/`:**

- Sections = Feature-specific, tidak reusable
- Components = Generic, reusable di mana saja

### `/src/layouts/`

**Purpose:** Layout wrappers untuk pages

**Types:**

- `auth/` - Layout untuk auth pages (login, register)
- `dashboard/` - Layout untuk dashboard pages (sidebar, navbar)
- `core/` - Core layout components

**Usage:**

```typescript
// routes/sections.tsx
{
  path: '/',
  element: <DashboardLayout />,  // Wrap with layout
  children: [
    { path: 'dashboard', element: <DashboardPage /> },
    { path: 'users', element: <UsersPage /> },
  ]
}
```

### `/src/services/`

**Purpose:** API communication layer

**Pattern:**

```typescript
// services/userService.ts
import { apiClient } from './api';

export const userService = {
  async getAll() {
    return apiClient.get('/users');
  },

  async getById(id: string) {
    return apiClient.get(`/users/${id}`);
  },

  async create(data: CreateUserDto) {
    return apiClient.post('/users', data);
  },

  async update(id: string, data: UpdateUserDto) {
    return apiClient.put(`/users/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete(`/users/${id}`);
  },
};
```

**Best Practices:**

- One service per resource/domain
- Use TypeScript types untuk request/response
- Handle errors di service level
- Implement retry logic jika perlu

### `/src/contexts/`

**Purpose:** React Context untuk global state

**Current Contexts:**

- `AuthContext` - Authentication state & methods

**Creating New Context:**

```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useState } from 'react';

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### `/src/routes/`

**Purpose:** Routing configuration

**Files:**

- `sections.tsx` - Route definitions
- `components/` - Route-related components (guards, error boundary)
- `hooks/` - Route-related hooks

**Route Structure:**

```typescript
export const routesSection = [
  // Auth routes
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },

  // Protected routes
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { element: <Navigate to="/dashboard" />, index: true },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  },

  // Error routes
  { path: '404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" /> },
];
```

### `/src/theme/`

**Purpose:** Theme configuration & MUI customization

**Files:**

- `theme-config.ts` - **Main config (edit this!)**
- `create-theme.ts` - Theme factory
- `theme-provider.tsx` - Theme provider component
- `core/` - MUI component overrides

### `/src/types/`

**Purpose:** TypeScript type definitions

**Organization:**

```typescript
// types/user.ts
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
};

export type CreateUserDto = Omit<User, 'id'>;
export type UpdateUserDto = Partial<CreateUserDto>;
```

**Best Practices:**

- Group by domain/feature
- Use `type` instead of `interface` (consistency)
- Export all types
- Use utility types (Partial, Pick, Omit)

### `/src/utils/`

**Purpose:** Helper functions & utilities

**Examples:**

- `format-number.ts` - Number formatting
- `format-time.ts` - Date/time formatting
- `validators.ts` - Form validation
- `storage.ts` - LocalStorage helpers

**Pattern:**

```typescript
// utils/format-currency.ts
export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

## 🔄 Data Flow

### 1. User Interaction → Component

```typescript
// User clicks button
<Button onClick={handleClick}>
  Submit
</Button>
```

### 2. Component → Service

```typescript
const handleClick = async () => {
  setLoading(true);
  try {
    await userService.create(formData);
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Service → API

```typescript
// userService.ts
async create(data) {
  const response = await axios.post('/api/users', data);
  return response.data;
}
```

### 4. API → Backend

```
POST /api/users
Body: { name: "John", email: "john@example.com" }
```

### 5. Response Flow (Reverse)

```
Backend → API → Service → Component → UI Update
```

## 🎯 Design Patterns

### 1. **Container/Presentational Pattern**

**Container (Smart Component):**

```typescript
// sections/user/view/user-view.tsx
export function UserView() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await userService.getAll();
    setUsers(data);
  };

  return <UserList users={users} />;
}
```

**Presentational (Dumb Component):**

```typescript
// components/user-list/user-list.tsx
type Props = {
  users: User[];
};

export function UserList({ users }: Props) {
  return (
    <List>
      {users.map(user => (
        <ListItem key={user.id}>{user.name}</ListItem>
      ))}
    </List>
  );
}
```

### 2. **Custom Hooks Pattern**

```typescript
// hooks/useUsers.ts
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return { users, loading, error, reload: loadUsers };
}

// Usage
function UserPage() {
  const { users, loading, error } = useUsers();

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <UserList users={users} />;
}
```

### 3. **Service Pattern**

Centralized API calls:

```typescript
// services/api.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Add interceptors
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. **Context + Hook Pattern**

```typescript
// contexts/CartContext.tsx
const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems([...items, item]);
  };

  return (
    <CartContext.Provider value={{ items, addItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be within CartProvider');
  return context;
}
```

## 🔐 Authentication Flow

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │ 1. Submit credentials
     ▼
┌────────────┐
│   Auth     │
│  Service   │
└────┬───────┘
     │ 2. POST /auth/login
     ▼
┌────────────┐
│  Backend   │
│    API     │
└────┬───────┘
     │ 3. Return token
     ▼
┌────────────┐
│   Auth     │
│  Context   │──── 4. Store token & user
└────┬───────┘
     │ 5. Update state
     ▼
┌────────────┐
│ Redirect   │
│    to      │
│ Dashboard  │
└────────────┘
```

## 🚀 Performance Best Practices

1. **Code Splitting**

```typescript
const UserPage = lazy(() => import('./pages/user'));
```

2. **Memoization**

```typescript
const MemoizedComponent = memo(MyComponent);
const memoizedValue = useMemo(() => expensiveCalc(), [deps]);
const memoizedCallback = useCallback(() => {}, [deps]);
```

3. **Virtualization** (untuk list panjang)

```typescript
import { FixedSizeList } from 'react-window';
```

4. **Debouncing** (untuk search)

```typescript
const debouncedSearch = debounce(searchFunction, 300);
```

## 📊 State Management Strategy

**Local State:** useState/useReducer

- Form data
- UI state (modals, tabs)
- Component-specific data

**Context:** React Context

- Auth state
- Theme
- Global settings

**Server State:** React Query (optional)

- API data caching
- Background refetching
- Optimistic updates

## 🧪 Testing Strategy (Future)

```
components/
  my-component/
    my-component.tsx
    my-component.test.tsx   ← Unit tests

pages/
  my-page.tsx
  my-page.test.tsx          ← Integration tests

e2e/
  user-flow.spec.ts         ← E2E tests
```

---

**Architecture ini dirancang untuk:**

- ✅ Scalability
- ✅ Maintainability
- ✅ Testability
- ✅ Developer Experience

Silakan adjust sesuai kebutuhan project Anda! 🚀
