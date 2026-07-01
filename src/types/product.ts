export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number | null; // giá khuyến mãi, null = không giảm
  stock: number;
  categoryId: string; // ref Category._id
  subcategoryId?: string; // ref Subcategory._id (SP cũ có thể chưa có)
  manufacturer?: string;
  usageInstructions?: string;
  ingredients?: string;
  images: ProductImage[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  categoryId: string;
  subcategoryId: string;
  manufacturer?: string;
  usageInstructions?: string;
  ingredients?: string;
  isActive?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ListProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}
