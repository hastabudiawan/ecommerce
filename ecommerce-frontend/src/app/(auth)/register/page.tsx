"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { register as registerUser } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // Register di backend langsung mengembalikan token, jadi user otomatis login
      setAuth(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      router.push("/");
    },
  });

  return (
    <>
      <h1 className="font-display text-2xl">Daftar</h1>
      <p className="mt-2 text-sm text-black/60">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-ink underline">
          Masuk
        </Link>
      </p>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="mt-6 space-y-4"
      >
        <Field label="Nama" {...registerField("name")} error={errors.name?.message} />
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
        <Field
          label="No. HP (opsional)"
          {...registerField("phone")}
          error={errors.phone?.message}
        />

        {mutation.isError && (
          <p className="text-sm text-sale">
            Registrasi gagal. Email mungkin sudah terdaftar.
          </p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Memproses..." : "Daftar"}
        </Button>
      </form>
    </>
  );
}