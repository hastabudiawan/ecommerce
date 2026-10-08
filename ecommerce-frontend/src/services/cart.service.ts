import { api } from "@/lib/api";
import type { ApiResponse, AddCartItemRequest, CartDto } from "@/types/api";

export async function getCart() {
  const res = await api.get<ApiResponse<CartDto>>("/cart");
  return res.data.data;
}

export async function addCartItem(payload: AddCartItemRequest) {
  const res = await api.post<ApiResponse<CartDto>>("/cart/items", payload);
  return res.data.data;
}

export async function updateCartItem({
  itemId,
  quantity,
}: {
  itemId: number;
  quantity: number;
}) {
  const res = await api.put<ApiResponse<CartDto>>(`/cart/items/${itemId}`, { quantity });
  return res.data.data;
}

export async function removeCartItem(itemId: number) {
  const res = await api.delete<ApiResponse<CartDto>>(`/cart/items/${itemId}`);
  return res.data.data;
}