"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/api";

interface RequireAuthProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [hasHydrated, user, roles, router]);

  if (!hasHydrated || !user || (roles && !roles.includes(user.role))) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-black/50">Memuat...</p>
      </div>
    );
  }

  return <>{children}</>;
}