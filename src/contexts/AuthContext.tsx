'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// TODO: thay mock này bằng user thật khi tích hợp JWT
const MOCK_ADMIN: AuthUser = {
  id: 'mock-admin',
  name: 'Admin',
  email: 'admin@datn.local',
  role: 'admin',
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value: AuthState = {
    user: MOCK_ADMIN,
    isLoading: false,
    login: async () => {
      // TODO: gọi POST /auth/login, set token, set user
    },
    logout: () => {
      // TODO: clear token, set user = null
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
