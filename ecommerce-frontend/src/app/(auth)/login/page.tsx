"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Tambahkan useQueryClient di sini
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/api";
import { getErrorMessage } from "@/lib/errors";

const roleRedirect: Record<UserRole, string> = {
  ADMIN: "/admin",
  SELLER: "/seller",
  CUSTOMER: "/",
};

// Hanya menerima path internal. URL absolut atau yang diawali "//" atau "/\"
// bisa dipakai untuk mengarahkan user ke situs lain setelah login (open redirect).
function getSafeNext(next: string | null) {
  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
  ) {
    return next;
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient(); // Ambil client di sini

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Bersihkan cache lama (misal: cart user sebelumnya)
      queryClient.clear();

      setAuth(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });

      const next = getSafeNext(searchParams.get("next"));
      router.push(next ?? roleRedirect[data.role]);
    },
  });

  return (
    <>
      <h1 className="font-display text-2xl">Masuk</h1>
      <p className="mt-2 text-sm text-black/60">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-ink underline">
          Daftar
        </Link>
      </p>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="mt-6 space-y-4"
      >
        <Field
          label="Email"
          type="email"
          {...registerField("email")}
          error={errors.email?.message}
        />
        <Field
          label="Password"
          type="password"
          {...registerField("password")}
          error={errors.password?.message}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-black/60 underline"
          >
            Lupa password?
          </Link>
        </div>
        {mutation.isError && (
          <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </>
  );
}
