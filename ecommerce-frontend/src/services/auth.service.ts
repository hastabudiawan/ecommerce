import { api } from "@/lib/api";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateStoreRequest,
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

export async function openStore(payload: CreateStoreRequest) {
  const res = await api.post<ApiResponse<AuthResponse>>("/auth/open-store", payload);
  return res.data.data;
}

export async function forgotPassword(email: string) {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) {
  await api.post("/auth/reset-password", { token, newPassword });
}

export async function verifyEmail(token: string) {
  await api.post("/auth/verify-email", { token });
}

export async function resendVerification() {
  await api.post("/auth/resend-verification");
}