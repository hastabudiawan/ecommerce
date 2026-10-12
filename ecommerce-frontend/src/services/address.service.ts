import { api } from "@/lib/api";
import type { Address, ApiResponse, CreateAddressRequest } from "@/types/api";

export async function getAddresses() {
  const res = await api.get<ApiResponse<Address[]>>("/addresses");
  return res.data.data;
}

export async function createAddress(payload: CreateAddressRequest) {
  const res = await api.post<ApiResponse<Address>>("/addresses", payload);
  return res.data.data;
}

export async function updateAddress({
  id,
  payload,
}: {
  id: number;
  payload: CreateAddressRequest;
}) {
  const res = await api.put<ApiResponse<Address>>(`/addresses/${id}`, payload);
  return res.data.data;
}

export async function setDefaultAddress(id: number) {
  const res = await api.put<ApiResponse<Address>>(`/addresses/${id}/default`);
  return res.data.data;
}

export async function deleteAddress(id: number) {
  await api.delete(`/addresses/${id}`);
}