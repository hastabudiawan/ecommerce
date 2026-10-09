import { api } from "@/lib/api";
import type {
  ApiResponse,
  CheckoutRequest,
  Order,
  OrderGroup,
  PageResponse,
} from "@/types/api";

export async function checkout(payload: CheckoutRequest) {
  const res = await api.post<ApiResponse<OrderGroup>>("/orders/checkout", payload);
  return res.data.data;
}

export async function getOrders({ page, size }: { page: number; size: number }) {
  const res = await api.get<ApiResponse<PageResponse<Order>>>("/orders", {
    params: { page, size },
  });
  return res.data.data;
}

export async function getOrder(id: number) {
  const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return res.data.data;
}