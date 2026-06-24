// Một tài liệu kỹ thuật đã nạp (gom theo docId ở backend).
export interface TechniqueDoc {
  docId: string;
  docTitle: string;
  chunks: number; // số đoạn (chunk) tách ra từ tài liệu
  createdAt: string;
}

// Kết quả trả về sau khi upload + nạp một tài liệu.
export interface UploadResult {
  docId: string;
  docTitle: string;
  chunks: number;
}
