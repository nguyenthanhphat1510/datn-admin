import { api } from './api';
import type {
  DiseaseDims,
  DimChunk,
  UpsertDimChunkDto,
  ReEmbedResult,
} from '@/types/dim-chunk';

/** Mọi bệnh kèm 4 chiều + danh sách chiều còn thiếu. */
export async function listDiseaseDims(): Promise<DiseaseDims[]> {
  const { data } = await api.get<DiseaseDims[]>('/disease-dims');
  return data;
}

/** 4 chiều của một bệnh theo slug. */
export async function getDiseaseDims(slug: string): Promise<DiseaseDims> {
  const { data } = await api.get<DiseaseDims>(`/disease-dims/${slug}`);
  return data;
}

/**
 * Tạo/ghi đè chiều của một bệnh. Backend LUÔN sinh lại vector, và NÉM LỖI nếu
 * embed thất bại (không lưu nửa vời) — nên chỗ gọi phải bắt lỗi để báo cho admin.
 */
export async function upsertDimChunk(
  slug: string,
  dto: UpsertDimChunkDto,
): Promise<DimChunk> {
  const { data } = await api.put<DimChunk>(`/disease-dims/${slug}`, dto);
  return data;
}

/** Sinh lại vector cho 1 chiều từ nội dung đang có. */
export async function reEmbedDimChunk(id: string): Promise<DimChunk> {
  const { data } = await api.patch<DimChunk>(`/disease-dims/chunk/${id}/re-embed`);
  return data;
}

/** Bật/tắt một chiều (tắt = không tham gia chấm điểm). */
export async function setDimChunkActive(
  id: string,
  isActive: boolean,
): Promise<DimChunk> {
  const { data } = await api.patch<DimChunk>(`/disease-dims/chunk/${id}/active`, {
    isActive,
  });
  return data;
}

/** Xóa hẳn một chiều. */
export async function deleteDimChunk(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/disease-dims/chunk/${id}`);
  return data;
}

/** Sinh lại vector cho MỌI chiều đang thiếu/hỏng vector. */
export async function reEmbedMissing(): Promise<ReEmbedResult> {
  const { data } = await api.post<ReEmbedResult>('/disease-dims/re-embed-missing');
  return data;
}
