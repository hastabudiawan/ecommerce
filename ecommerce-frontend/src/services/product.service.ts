import { api } from "@/lib/api";
import type { ApiResponse, PageResponse, Product } from "@/types/api";

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