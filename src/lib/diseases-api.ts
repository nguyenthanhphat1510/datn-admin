import { api } from './api';
import type {
  Disease,
  CreateDiseaseDto,
  UpdateDiseaseDto,
} from '@/types/disease';

export async function listDiseases(includeInactive = false): Promise<Disease[]> {
  const { data } = await api.get<Disease[]>('/diseases', {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return data;
}

export async function getDisease(id: string): Promise<Disease> {
  const { data } = await api.get<Disease>(`/diseases/${id}`);
  return data;
}

export async function createDisease(dto: CreateDiseaseDto): Promise<Disease> {
  const { data } = await api.post<Disease>('/diseases', dto);
  return data;
}

export async function updateDisease(id: string, dto: UpdateDiseaseDto): Promise<Disease> {
  const { data } = await api.patch<Disease>(`/diseases/${id}`, dto);
  return data;
}

export async function softDeleteDisease(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/diseases/${id}`);
  return data;
}

export async function hardDeleteDisease(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/diseases/${id}/permanent`);
  return data;
}

export async function restoreDisease(id: string): Promise<Disease> {
  const { data } = await api.patch<Disease>(`/diseases/${id}/restore`);
  return data;
}
