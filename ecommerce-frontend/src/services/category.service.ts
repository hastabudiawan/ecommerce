import { api } from "@/lib/api";
import type { ApiResponse, Category } from "@/types/api";

export async function getCategories() {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
}