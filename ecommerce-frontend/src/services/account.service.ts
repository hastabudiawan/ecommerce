import { api } from "@/lib/api";
import type {
  Account,
  ApiResponse,
  AuthResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@/types/api";

export async function getMe() {
  const res = await api.get<ApiResponse<Account>>("/account/me");
  return res.data.data;
}

export async function updateProfile(payload: UpdateProfileRequest) {
  const res = await api.put<ApiResponse<Account>>("/account/me", payload);
  return res.data.data;
}

export async function changePassword(payload: ChangePasswordRequest) {
  const res = await api.put<ApiResponse<AuthResponse>>("/account/password", payload);
  return res.data.data;
}