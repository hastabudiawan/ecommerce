"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { login } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/api";

const roleRedirect: Record<UserRole, string> = {
  ADMIN: "/admin",
  SELLER: "/seller",
  CUSTOMER: "/",
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      router.push(roleRedirect[data.role]);
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

        {mutation.isError && (
          <p className="text-sm text-sale">
            Email atau password salah. Silakan coba lagi.
          </p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </>
  );
}