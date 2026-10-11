import axios from "axios";
import { isTokenExpired } from "@/lib/jwt";
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
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";
    const token = useAuthStore.getState().token;

    // Request login/register yang gagal (401 karena password salah) bukan sesi habis,
    // biarkan halamannya sendiri yang menampilkan pesan error.
    const isAuthRequest = url.startsWith("/auth/");

    // Sesi dianggap habis kalau: backend membalas 401, atau backend membalas 403
    // sementara token yang tersimpan memang sudah lewat masa berlakunya.
    // 403 dengan token yang masih berlaku berarti masalah hak akses (role), bukan sesi.
    const sessionExpired =
      !isAuthRequest &&
      (status === 401 || (status === 403 && !!token && isTokenExpired(token)));

    if (sessionExpired) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
    }

    return Promise.reject(error);
  },
);