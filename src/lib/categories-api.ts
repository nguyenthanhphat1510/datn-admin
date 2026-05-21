import { api } from './api';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/category';

export async function listCategories(includeInactive = false): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories', {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return data;
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${id}`);
  return data;
}

export async function createCategory(dto: CreateCategoryDto): Promise<Category> {
  const { data } = await api.post<Category>('/categories', dto);
  return data;
}

export async function updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, dto);
  return data;
}

export async function softDeleteCategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/categories/${id}`);
  return data;
}

export async function hardDeleteCategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/categories/${id}/permanent`);
  return data;
}

export async function restoreCategory(id: string): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}/restore`);
  return data;
}
