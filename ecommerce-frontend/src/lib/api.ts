import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export type SettlementStatus = "PENDING" | "RELEASED";

export interface Settlement {
  id: number;
  orderNumber: string;
  amount: number;
  status: SettlementStatus;
  createdAt: string;
  releasedAt: string | null;
}

export interface SettlementSummary {
  totalPending: number;
  totalReleased: number;
}