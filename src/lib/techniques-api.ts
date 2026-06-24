import { api } from './api';
import type { TechniqueDoc, UploadResult } from '@/types/technique';

export async function listTechniques(): Promise<TechniqueDoc[]> {
  const { data } = await api.get<TechniqueDoc[]>('/techniques');
  return data;
}

export async function uploadTechnique(file: File): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file); // field "file" — khớp FileInterceptor('file') ở backend
  const { data } = await api.post<UploadResult>('/techniques/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteTechnique(
  docId: string,
): Promise<{ message: string; deleted: number }> {
  const { data } = await api.delete<{ message: string; deleted: number }>(
    `/techniques/${encodeURIComponent(docId)}`,
  );
  return data;
}
