import { api } from "@/lib/api";
import type { ApiResponse, Category } from "@/types/api";

export async function getCategories() {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
}

export async function createCategory(name: string) {
  const res = await api.post<ApiResponse<Category>>("/categories", { name });
  return res.data.data;
}

export async function updateCategory({ id, name }: { id: number; name: string }) {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, { name });
  return res.data.data;
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}