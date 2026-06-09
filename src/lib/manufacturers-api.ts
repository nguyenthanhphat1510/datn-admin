import { api } from './api';
import type {
  Manufacturer,
  CreateManufacturerDto,
  UpdateManufacturerDto,
} from '@/types/manufacturer';

export async function listManufacturers(includeInactive = false): Promise<Manufacturer[]> {
  const { data } = await api.get<Manufacturer[]>('/manufacturers', {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return data;
}

export async function getManufacturer(id: string): Promise<Manufacturer> {
  const { data } = await api.get<Manufacturer>(`/manufacturers/${id}`);
  return data;
}

export async function createManufacturer(dto: CreateManufacturerDto): Promise<Manufacturer> {
  const { data } = await api.post<Manufacturer>('/manufacturers', dto);
  return data;
}

export async function updateManufacturer(
  id: string,
  dto: UpdateManufacturerDto,
): Promise<Manufacturer> {
  const { data } = await api.patch<Manufacturer>(`/manufacturers/${id}`, dto);
  return data;
}

export async function softDeleteManufacturer(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/manufacturers/${id}`);
  return data;
}

export async function hardDeleteManufacturer(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/manufacturers/${id}/permanent`);
  return data;
}

export async function restoreManufacturer(id: string): Promise<Manufacturer> {
  const { data } = await api.patch<Manufacturer>(`/manufacturers/${id}/restore`);
  return data;
}

export async function uploadManufacturerLogo(id: string, file: File): Promise<Manufacturer> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<Manufacturer>(`/manufacturers/${id}/logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteManufacturerLogo(id: string): Promise<Manufacturer> {
  const { data } = await api.delete<Manufacturer>(`/manufacturers/${id}/logo`);
  return data;
}
