import { api } from './api';
import type {
  CreateProductDto,
  ListProductsParams,
  PaginatedProducts,
  Product,
  UpdateProductDto,
} from '@/types/product';

export async function listProducts(params: ListProductsParams = {}): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/products', { params });
  return data;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await api.get<Product>(`/products/${id}`);
  return data;
}

export async function createProduct(dto: CreateProductDto): Promise<Product> {
  const { data } = await api.post<Product>('/products', dto);
  return data;
}

export async function updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, dto);
  return data;
}

export async function softDeleteProduct(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/products/${id}`);
  return data;
}

export async function hardDeleteProduct(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/products/${id}/permanent`);
  return data;
}

export async function restoreProduct(id: string): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}/restore`);
  return data;
}

export async function uploadProductImages(id: string, files: File[]): Promise<Product> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const { data } = await api.post<Product>(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteProductImage(id: string, publicId: string): Promise<Product> {
  const { data } = await api.delete<Product>(`/products/${id}/images`, {
    params: { publicId },
  });
  return data;
}
