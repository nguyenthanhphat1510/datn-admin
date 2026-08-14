/**
 * 4 DẤU HIỆU mô tả một bệnh lúa — phải khớp `DISEASE_DIMS` ở backend
 * (backend/src/diseases/entities/disease-dim-chunk.entity.ts).
 * Tên khóa (`viTri`, `hinhDang`...) là hợp đồng với backend, KHÔNG đổi;
 * chỉ nhãn hiển thị bên dưới mới đổi được.
 *
 * ĐÃ BỎ dấu hiệu `giaiDoan`: giai đoạn lúa là thông tin về CÂY chứ không phải về
 * VẾT BỆNH, nhiều bệnh cùng phát ở một giai đoạn nên nó kéo điểm sang bệnh sai.
 * Bốn dấu hiệu còn lại đều tả hình thái vết bệnh. Xem lý do đầy đủ ở entity backend.
 */
export const DISEASE_DIMS = ['viTri', 'hinhDang', 'mauSac', 'phanBo'] as const;

export type DiseaseDim = (typeof DISEASE_DIMS)[number];

/** Nhãn tiếng Việt của từng dấu hiệu. */
export const DIM_LABEL: Record<DiseaseDim, string> = {
  viTri: 'Vị trí vết bệnh',
  hinhDang: 'Hình dạng vết',
  mauSac: 'Màu sắc vết',
  phanBo: 'Cách phân bố',
};

/**
 * Gợi ý cho admin biết mỗi ô nên viết gì. Chunk phải viết đủ PHÂN BIỆT với bệnh
 * khác ở cùng dấu hiệu — hai chunk cùng dấu hiệu viết na ná nhau thì dấu hiệu đó
 * vô dụng.
 */
export const DIM_HINT: Record<DiseaseDim, string> = {
  viTri: 'Vết nằm ở đâu: giữa phiến lá / mép lá / cổ bông / bẹ / vỏ hạt...',
  hinhDang: 'Hình dạng vết: hình thoi hai đầu nhọn / tròn tù / sọc dài / vành thắt...',
  mauSac: 'Màu vết và diễn tiến màu: xám tro viền nâu / nâu có quầng vàng / bạc trắng...',
  phanBo: 'Cách phân bố: rải rác riêng lẻ / liên kết thành mảng / lan từ mép vào...',
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

/** Toàn cảnh 5 dấu hiệu của một bệnh — dấu hiệu chưa có thì `chunk` là null. */
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
