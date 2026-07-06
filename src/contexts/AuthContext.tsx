'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiLogin, type AuthApiUser } from '@/lib/auth-api';

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

// Key riêng cho admin để không đụng phiên đăng nhập của cửa hàng (frontend)
// nếu mở cùng trình duyệt.
const TOKEN_KEY = 'admin_access_token';
const USER_KEY = 'admin_user';

/** Map user backend (fullName) → AuthUser của admin (name). */
function toAuthUser(u: AuthApiUser): AuthUser {
  return {
    id: u.id,
    name: u.fullName ?? u.email,
    email: u.email,
    role: u.role,
  };
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khôi phục phiên từ localStorage khi tải lại trang.
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (token && userStr) {
        setUser(JSON.parse(userStr) as AuthUser);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      // Chỉ cho phép tài khoản admin vào panel — không lưu token nếu là user thường.
      if (data.user.role !== 'admin') {
        throw new Error('Tài khoản này không có quyền quản trị.');
      }
      persist(data.access_token, toAuthUser(data.user));
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Export tên key token để interceptor axios đọc cùng một chỗ. */
export const ADMIN_TOKEN_KEY = TOKEN_KEY;
