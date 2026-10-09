import axios from "axios";
import { api } from "@/lib/api";
import type { ApiResponse, CreateStoreRequest, SellerStore } from "@/types/api";

// Backend membalas 404 kalau seller belum punya toko. Itu keadaan normal,
// bukan error, jadi diubah jadi null supaya mudah dibedakan di halaman.
export async function getMyStore(): Promise<SellerStore | null> {
  try {
    const res = await api.get<ApiResponse<SellerStore>>("/seller/store");
    return res.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createStore(payload: CreateStoreRequest) {
  const res = await api.post<ApiResponse<SellerStore>>("/seller/store", payload);
  return res.data.data;
}