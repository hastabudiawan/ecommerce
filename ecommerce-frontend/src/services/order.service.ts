import { api } from "@/lib/api";
import type { ApiResponse, CheckoutRequest, OrderGroup } from "@/types/api";

export async function checkout(payload: CheckoutRequest) {
  const res = await api.post<ApiResponse<OrderGroup>>("/orders/checkout", payload);
  return res.data.data;
}