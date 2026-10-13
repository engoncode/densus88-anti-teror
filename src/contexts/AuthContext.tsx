// src/contexts/AuthContext.tsx
import type { ReactNode } from 'react';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import authService from '../services/authService';
import type { User } from '../types/common';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAnalyst: boolean;
  isOperator: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await authService.login({ email, password });
    setUser(loggedInUser);
  }, []);

  const loginWithGoogle = useCallback(async (token: string) => {
    const { user: loggedInUser } = await authService.loginWithGoogle(token);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role?.name === 'Super Admin',
      isAnalyst: user?.role?.name === 'Analyst',
      isOperator: user?.role?.name === 'Operator',
    }),
    [user, loading, login, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
