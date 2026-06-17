import { api } from './api';
import type { DashboardStats } from '@/types/dashboard';

/** [Admin] Lấy số liệu tổng hợp cho trang dashboard. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard/stats');
  return data;
}
