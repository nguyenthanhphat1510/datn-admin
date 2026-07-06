import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
});

// Key token đồng bộ với AuthContext (ADMIN_TOKEN_KEY). Hardcode ở đây để tránh
// phụ thuộc vòng (AuthContext → auth-api → api).
const ADMIN_TOKEN_KEY = 'admin_access_token';
const ADMIN_USER_KEY = 'admin_user';

// Gắn JWT vào mọi request nếu đã đăng nhập.
api.interceptors.request.use((cfg) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }
  }
  return cfg;
});

// Token hết hạn / không hợp lệ (401) → xóa phiên và đưa về trang login.
// Bỏ qua chính request /auth/login để không cướp thông báo "sai mật khẩu".
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    if (status === 401 && typeof window !== 'undefined' && !url.includes('/auth/login')) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
