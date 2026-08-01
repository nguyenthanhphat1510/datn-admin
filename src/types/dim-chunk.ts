/**
 * 5 CHIỀU mô tả một bệnh lúa — phải khớp `DISEASE_DIMS` ở backend
 * (backend/src/diseases/entities/disease-dim-chunk.entity.ts).
 */
export const DISEASE_DIMS = [
  'viTri',
  'hinhDang',
  'mauSac',
  'phanBo',
  'giaiDoan',
] as const;

export type DiseaseDim = (typeof DISEASE_DIMS)[number];

/** Nhãn tiếng Việt của từng chiều. */
export const DIM_LABEL: Record<DiseaseDim, string> = {
  viTri: 'Vị trí vết bệnh',
  hinhDang: 'Hình dạng vết bệnh',
  mauSac: 'Màu sắc vết bệnh',
  phanBo: 'Cách phân bố vết bệnh',
  giaiDoan: 'Giai đoạn lúa lúc phát bệnh',
};

/**
 * Gợi ý cho admin biết mỗi ô nên viết gì. Chunk phải viết đủ PHÂN BIỆT với bệnh
 * khác ở cùng chiều — hai chunk cùng chiều viết na ná nhau thì chiều đó vô dụng.
 */
export const DIM_HINT: Record<DiseaseDim, string> = {
  viTri: 'Vết nằm ở đâu: giữa phiến lá / mép lá / cổ bông / bẹ / vỏ hạt...',
  hinhDang: 'Hình dạng vết: hình thoi hai đầu nhọn / tròn tù / sọc dài / vành thắt...',
  mauSac: 'Màu vết và diễn tiến màu: xám tro viền nâu / nâu có quầng vàng / bạc trắng...',
  phanBo: 'Cách phân bố: rải rác riêng lẻ / liên kết thành mảng / lan từ mép vào...',
  giaiDoan: 'Lúa ở giai đoạn nào khi bệnh nặng: đẻ nhánh / làm đòng / trỗ / chín...',
};

export interface DimChunk {
  _id: string;
  diseaseSlug: string;
  diseaseName: string;
  chieu: DiseaseDim;
  content: string;
  isActive: boolean;
  /** Đã sinh vector đúng số chiều chưa. false = chiều này KHÔNG được chấm điểm. */
  hasEmbedding: boolean;
  updatedAt: string;
}

/** Toàn cảnh 5 chiều của một bệnh — chiều chưa có thì `chunk` là null. */
export interface DiseaseDims {
  diseaseSlug: string;
  diseaseName: string;
  dims: { chieu: DiseaseDim; chunk: DimChunk | null }[];
  /** Chiều thiếu / đang tắt / chưa embed được — đều là chiều cần xử lý. */
  missingDims: DiseaseDim[];
}

export interface UpsertDimChunkDto {
  chieu: DiseaseDim;
  content: string;
  isActive?: boolean;
}

export interface ReEmbedResult {
  total: number;
  done: number;
  failed: number;
}
