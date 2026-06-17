import { api } from './api';
import type { User, UserRole } from '@/types/user';

/** [Admin] Lấy toàn bộ người dùng (không phân trang). */
export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users');
  return data;
}

/** [Admin] Cập nhật vai trò / trạng thái kích hoạt của 1 user. */
export async function updateUser(
  id: string,
  dto: { role?: UserRole; isActive?: boolean; fullName?: string },
): Promise<{ message: string; user: User }> {
  const { data } = await api.patch<{ message: string; user: User }>(
    `/users/${id}`,
    dto,
  );
  return data;
}
