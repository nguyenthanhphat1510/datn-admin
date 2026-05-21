export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubcategoryDto {
  name: string;
  categoryId: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateSubcategoryDto = Partial<CreateSubcategoryDto>;
