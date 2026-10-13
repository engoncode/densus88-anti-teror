# 📦 Code Snippets & Templates

Koleksi code snippets yang sering digunakan untuk mempercepat development.

## 📄 Page Templates

### Basic Page

```typescript
import type { FC } from 'react';
import { Container, Typography, Box } from '@mui/material';

export const MyPage: FC = () => {
  return (
    <Container maxWidth="xl">
      <Typography variant="h3" gutterBottom>
        Page Title
      </Typography>

      <Box sx={{ mt: 3 }}>
        {/* Content here */}
      </Box>
    </Container>
  );
};
```

### Page with Header & Actions

```typescript
import type { FC } from 'react';
import { Container, Typography, Box, Button, Stack } from '@mui/material';
import { Iconify } from '../components/iconify';

export const MyPage: FC = () => {
  return (
    <Container maxWidth="xl">
      {/* Header with Actions */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <div>
          <Typography variant="h3" gutterBottom>
            Page Title
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Page description here
          </Typography>
        </div>

        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          onClick={() => console.log('Action clicked')}
        >
          New Item
        </Button>
      </Stack>

      {/* Content */}
      <Box>
        Content here
      </Box>
    </Container>
  );
};
```

### Page with Data Loading

```typescript
import { useState, useEffect } from 'react';
import { Container, Typography, CircularProgress, Alert } from '@mui/material';

export function MyPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      // const response = await myService.getAll();
      // setData(response);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h3">My Page</Typography>
      {/* Render data */}
    </Container>
  );
}
```

## 🎨 Component Templates

### Card Component

```typescript
import type { FC } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box } from '@mui/material';
import { Iconify } from '../components/iconify';

type MyCardProps = {
  title: string;
  description: string;
  onAction?: () => void;
};

export const MyCard: FC<MyCardProps> = ({ title, description, onAction }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Iconify icon="solar:star-bold-duotone" width={24} sx={{ mr: 1 }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      {onAction && (
        <CardActions>
          <Button size="small" onClick={onAction}>
            Learn More
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
```

### Modal/Dialog Component

```typescript
import type { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

type MyDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

export const MyDialog: FC<MyDialogProps> = ({ open, onClose, onSubmit }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Input Label"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Table Component

```typescript
import type { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Iconify } from '../components/iconify';

type User = {
  id: string;
  name: string;
  email: string;
};

type UserTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

export const UserTable: FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit(user)}>
                  <Iconify icon="solar:pen-bold" width={20} />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(user)}>
                  <Iconify icon="solar:trash-bin-bold" width={20} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## 🔧 Custom Hooks

### useFetch Hook

```typescript
import { useState, useEffect } from 'react';

type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useFetch<T>(fetchFn: () => Promise<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

// Usage
function MyComponent() {
  const { data, loading, error, refetch } = useFetch(() => myService.getAll());

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### useLocalStorage Hook

```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage
function MyComponent() {
  const [name, setName] = useLocalStorage('userName', '');

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
  );
}
```

### useDebounce Hook

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage: Search dengan debounce
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Perform search
      console.log('Searching for:', debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## 🌐 API Service Patterns

### CRUD Service Template

```typescript
// services/resourceService.ts
import { apiClient } from './api';

export type Resource = {
  id: string;
  name: string;
  // ... other fields
};

export type CreateResourceDto = Omit<Resource, 'id'>;
export type UpdateResourceDto = Partial<CreateResourceDto>;

export const resourceService = {
  // Get all
  async getAll(params?: any) {
    const { data } = await apiClient.get('/resources', { params });
    return data;
  },

  // Get one
  async getById(id: string) {
    const { data } = await apiClient.get(`/resources/${id}`);
    return data;
  },

  // Create
  async create(payload: CreateResourceDto) {
    const { data } = await apiClient.post('/resources', payload);
    return data;
  },

  // Update
  async update(id: string, payload: UpdateResourceDto) {
    const { data } = await apiClient.put(`/resources/${id}`, payload);
    return data;
  },

  // Delete
  async delete(id: string) {
    const { data } = await apiClient.delete(`/resources/${id}`);
    return data;
  },

  // Search
  async search(query: string) {
    const { data } = await apiClient.get('/resources/search', {
      params: { q: query },
    });
    return data;
  },
};
```

### API Client with Interceptors

```typescript
// services/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);
```

## 📋 Form Patterns

### Form with Validation

```typescript
import { useState } from 'react';
import { TextField, Button, Stack, Alert } from '@mui/material';

type FormData = {
  name: string;
  email: string;
};

type FormErrors = {
  name?: string;
  email?: string;
};

export function MyForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitError(null);
      // await myService.create(formData);
      console.log('Form submitted:', formData);
      // Reset form or redirect
    } catch (err) {
      setSubmitError('Failed to submit form');
      console.error(err);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear error on change
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {submitError && (
          <Alert severity="error">{submitError}</Alert>
        )}

        <TextField
          label="Name"
          value={formData.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
        />

        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
        />

        <Button type="submit" variant="contained" size="large">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
```

## 🎯 Layout Patterns

### Grid Layout

```typescript
import { Grid, Card, CardContent } from '@mui/material';

export function GridLayout() {
  const items = [1, 2, 3, 4, 5, 6];

  return (
    <Grid container spacing={3}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item}>
          <Card>
            <CardContent>
              Item {item}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
```

### Stack Layout

```typescript
import { Stack, Box } from '@mui/material';

export function StackLayout() {
  return (
    <Stack spacing={2}>
      <Box>Item 1</Box>
      <Box>Item 2</Box>
      <Box>Item 3</Box>
    </Stack>
  );
}
```

## 🎨 Styling Patterns

### Using sx Prop

```typescript
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 3,
    },
  }}
>
  Content
</Box>
```

### Using Theme

```typescript
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();

  return (
    <div style={{
      color: theme.palette.primary.main,
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.default,
    }}>
      Content
    </div>
  );
}
```

## 🔔 Notification/Toast Pattern

```typescript
// Create a toast context or use a library like notistack
import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export function useToast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (msg: string, sev: typeof severity = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const Toast = () => (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={() => setOpen(false)}
    >
      <Alert severity={severity} onClose={() => setOpen(false)}>
        {message}
      </Alert>
    </Snackbar>
  );

  return { showToast, Toast };
}

// Usage
function MyComponent() {
  const { showToast, Toast } = useToast();

  const handleClick = () => {
    showToast('Operation successful!', 'success');
  };

  return (
    <>
      <button onClick={handleClick}>Show Toast</button>
      <Toast />
    </>
  );
}
```

---

**Gunakan snippets ini untuk mempercepat development! 🚀**

Simpan file ini sebagai referensi saat coding.
