"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, removeToken, type User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, nickname?: string) => Promise<void>;
  startDemo: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((response) => setUser(response.user))
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, nickname?: string) => {
    const response = await authApi.register({ username, email, password, nickname });
    setUser(response.user);
  }, []);

  const startDemo = useCallback(async () => {
    const response = await authApi.demo();
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, startDemo, logout, setUser, isAuthenticated: !!user }),
    [user, loading, login, register, startDemo, logout]
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
