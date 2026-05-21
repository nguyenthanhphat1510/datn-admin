import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',
});

// TODO: khi bật phân quyền, thêm interceptor gắn JWT từ AuthContext / localStorage:
// api.interceptors.request.use((cfg) => {
//   const token = localStorage.getItem('admin_token');
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });
