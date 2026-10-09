import { api } from "@/lib/api";
import type {
  ApiResponse,
  PageResponse,
  Product,
  ProductImage,
  ProductRequest,
} from "@/types/api";

export interface ProductQuery {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

export async function getProducts(params: ProductQuery = {}) {
  const res = await api.get<ApiResponse<PageResponse<Product>>>("/products", {
    params,
  });
  return res.data.data;
}

export async function getProductBySlug(slug: string) {
  const res = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`);
  return res.data.data;
}

export async function getProductById(id: number) {
  const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return res.data.data;
}

export async function getMyProducts({ page, size }: { page: number; size: number }) {
  const res = await api.get<ApiResponse<PageResponse<Product>>>(
    "/products/seller/my-products",
    { params: { page, size } },
  );
  return res.data.data;
}

export async function createSellerProduct(payload: ProductRequest) {
  const res = await api.post<ApiResponse<Product>>("/products/seller", payload);
  return res.data.data;
}

export async function updateSellerProduct({
  id,
  payload,
}: {
  id: number;
  payload: ProductRequest;
}) {
  const res = await api.put<ApiResponse<Product>>(`/products/seller/${id}`, payload);
  return res.data.data;
}

export async function uploadProductImage({
  productId,
  file,
  isPrimary,
}: {
  productId: number;
  file: File;
  isPrimary: boolean;
}) {
  const form = new FormData();
  form.append("file", file);
  form.append("isPrimary", String(isPrimary));

  const res = await api.post<ApiResponse<ProductImage>>(
    `/products/${productId}/images`,
    form,
  );
  return res.data.data;
}

export async function deleteProductImage({
  productId,
  imageId,
}: {
  productId: number;
  imageId: number;
}) {
  await api.delete(`/products/${productId}/images/${imageId}`);
}