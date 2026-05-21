import { api } from './api';
import type {
  Subcategory,
  CreateSubcategoryDto,
  UpdateSubcategoryDto,
} from '@/types/subcategory';

export async function listSubcategories(
  includeInactive = false,
  categoryId?: string,
): Promise<Subcategory[]> {
  const params: Record<string, string> = {};
  if (includeInactive) params.includeInactive = 'true';
  if (categoryId) params.categoryId = categoryId;
  const { data } = await api.get<Subcategory[]>('/subcategories', { params });
  return data;
}

export async function getSubcategory(id: string): Promise<Subcategory> {
  const { data } = await api.get<Subcategory>(`/subcategories/${id}`);
  return data;
}

export async function createSubcategory(dto: CreateSubcategoryDto): Promise<Subcategory> {
  const { data } = await api.post<Subcategory>('/subcategories', dto);
  return data;
}

export async function updateSubcategory(
  id: string,
  dto: UpdateSubcategoryDto,
): Promise<Subcategory> {
  const { data } = await api.patch<Subcategory>(`/subcategories/${id}`, dto);
  return data;
}

export async function softDeleteSubcategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/subcategories/${id}`);
  return data;
}

export async function hardDeleteSubcategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/subcategories/${id}/permanent`);
  return data;
}

export async function restoreSubcategory(id: string): Promise<Subcategory> {
  const { data } = await api.patch<Subcategory>(`/subcategories/${id}/restore`);
  return data;
}
