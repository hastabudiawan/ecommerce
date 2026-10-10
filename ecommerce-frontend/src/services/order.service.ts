import { api } from "@/lib/api";
import type {
  ApiResponse,
  CheckoutRequest,
  Order,
  OrderGroup,
  OrderStatus,
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

export async function getSellerOrders({ page, size }: { page: number; size: number }) {
  const res = await api.get<ApiResponse<PageResponse<Order>>>("/orders/seller", {
    params: { page, size },
  });
  return res.data.data;
}

export async function updateSellerOrderStatus({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const res = await api.put<ApiResponse<Order>>(`/orders/seller/${orderId}/status`, {
    status,
  });
  return res.data.data;
}

export async function getOrdersForAdmin({
  status,
  page,
  size,
}: {
  status?: OrderStatus;
  page: number;
  size: number;
}) {
  const res = await api.get<ApiResponse<PageResponse<Order>>>("/orders/admin", {
    params: { status, page, size },
  });
  return res.data.data;
}

export async function updateOrderStatus({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const res = await api.put<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
  return res.data.data;
}