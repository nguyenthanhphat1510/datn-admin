import { api } from './api';

/** Hình dạng user backend trả về (auth.service.ts → sanitizeUser). */
export interface AuthApiUser {
  id: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
  role: 'admin' | 'user';
  isActive: boolean;
}

export interface AuthResponse {
  message: string;
  user: AuthApiUser;
  access_token: string;
}

/** POST /auth/login — dùng chung endpoint với người dùng. */
export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
}

/** GET /auth/profile — lấy lại thông tin user từ token (khôi phục phiên). */
export async function apiGetProfile(token: string): Promise<AuthApiUser> {
  const res = await api.get<AuthApiUser>('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
