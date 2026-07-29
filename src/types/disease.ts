/**
 * Đặc trưng nhận dạng rút gọn để chatbot hiển thị thẻ đối chiếu. 3 chiều
 * viTri/hinhDang/mauSac được chatbot ghép thành query khi người dùng bấm thẻ;
 * giaiDoan chỉ để hiển thị. Xem ChatbotService.toDiseaseChoices.
 */
export interface KeyFeatures {
  viTri?: string;
  hinhDang?: string;
  mauSac?: string;
  giaiDoan?: string;
}

export interface Disease {
  _id: string;
  name: string;
  slug: string;
  symptoms: string[];
  description?: string;
  keyFeatures?: KeyFeatures;
  recommendedProductIds: string[];
  images: { url: string; publicId: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiseaseDto {
  name: string;
  slug?: string;
  symptoms?: string[];
  description?: string;
  keyFeatures?: KeyFeatures;
  recommendedProductIds?: string[];
  isActive?: boolean;
}

export type UpdateDiseaseDto = Partial<CreateDiseaseDto>;
