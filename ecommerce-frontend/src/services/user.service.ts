import { api } from "@/lib/api";
import type { AdminUser, ApiResponse, PageResponse, UserRole } from "@/types/api";

export async function getUsers({
  q,
  role,
  page,
  size,
}: {
  q: string;
  role?: UserRole;
  page: number;
  size: number;
}) {
  const res = await api.get<ApiResponse<PageResponse<AdminUser>>>("/admin/users", {
    params: { q, role, page, size },
  });
  return res.data.data;
}

export async function changeUserRole({ id, role }: { id: number; role: UserRole }) {
  const res = await api.put<ApiResponse<AdminUser>>(`/admin/users/${id}/role`, { role });
  return res.data.data;
}

export async function setUserEnabled({ id, enabled }: { id: number; enabled: boolean }) {
  const res = await api.put<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, {
    enabled,
  });
  return res.data.data;
}