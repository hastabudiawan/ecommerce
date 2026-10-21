"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/errors";
import { forgotSchema, type ForgotFormValues } from "@/lib/validation/auth";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({ resolver: zodResolver(forgotSchema) });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => setSent(true),
  });

  if (sent) {
    return (
      <>
        <h1 className="font-display text-2xl">Cek email kamu</h1>
        <p className="mt-3 text-sm text-black/60">
          Jika email itu terdaftar, kami telah mengirim tautan untuk mengatur ulang
          password. Tautan berlaku 1 jam. Kalau belum ada, cek folder spam atau coba lagi
          beberapa saat lagi.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm font-medium underline">
          Kembali ke halaman masuk
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl">Lupa Password</h1>
      <p className="mt-2 text-sm text-black/60">
        Masukkan email akunmu. Kami akan mengirim tautan untuk membuat password baru.
      </p>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values.email))}
        className="mt-6 space-y-4"
      >
        <Field
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        {mutation.isError && (
          <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Mengirim..." : "Kirim Tautan"}
        </Button>
      </form>

      <Link href="/login" className="mt-6 inline-block text-sm text-black/60 underline">
        Kembali ke halaman masuk
      </Link>
    </>
  );
}