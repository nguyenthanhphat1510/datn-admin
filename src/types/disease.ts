export interface Disease {
  _id: string;
  name: string;
  slug: string;
  symptoms: string[];
  description?: string;
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
  recommendedProductIds?: string[];
  isActive?: boolean;
}

export type UpdateDiseaseDto = Partial<CreateDiseaseDto>;
