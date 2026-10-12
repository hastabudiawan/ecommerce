"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/account.service";
import { useAuthStore } from "@/store/auth.store";

// Tidak menampilkan apa pun. Menjaga data akun di frontend (nama, role) tetap
// sama dengan yang ada di server, misalnya setelah admin mengubah role seseorang.
export function AuthSync() {
  const { token, user, hasHydrated, setAuth } = useAuthStore();

  const { data } = useQuery({
    // userId ada di kunci supaya data akun lain tidak pernah dipakai untuk akun ini
    queryKey: ["me", user?.userId],
    queryFn: getMe,
    enabled: hasHydrated && !!token && !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!data || !token || !user || data.id !== user.userId) return;

    if (data.role !== user.role || data.name !== user.name || data.email !== user.email) {
      setAuth(token, {
        userId: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      });
    }
  }, [data, token, user, setAuth]);

  return null;
}