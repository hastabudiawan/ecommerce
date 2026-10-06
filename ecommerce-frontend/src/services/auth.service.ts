import { api } from "@/lib/api";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/api";

export async function login(payload: LoginRequest) {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
  return res.data.data;
}

export async function register(payload: RegisterRequest) {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", payload);
  return res.data.data;
}

export async function logout() {
  await api.post("/auth/logout");
}