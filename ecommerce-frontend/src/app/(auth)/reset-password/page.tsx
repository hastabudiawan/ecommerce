"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/errors";
import { resetSchema, type ResetFormValues } from "@/lib/validation/auth";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({ resolver: zodResolver(resetSchema) });

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => setDone(true),
  });

  if (!token) {
    return (
      <>
        <h1 className="font-display text-2xl">Tautan tidak lengkap</h1>
        <p className="mt-3 text-sm text-black/60">
          Tautan atur ulang password tidak memuat kode. Minta tautan baru.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block text-sm font-medium underline">
          Minta tautan baru
        </Link>
      </>
    );
  }

  if (done) {
    return (
      <>
        <h1 className="font-display text-2xl">Password diperbarui</h1>
        <p className="mt-3 text-sm text-black/60">
          Passwordmu sudah diganti, dan semua perangkat yang sebelumnya login telah
          dikeluarkan. Silakan masuk dengan password baru.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Masuk
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl">Password Baru</h1>

      <form
        onSubmit={handleSubmit((values) =>
          mutation.mutate({ token, newPassword: values.newPassword }),
        )}
        className="mt-6 space-y-4"
      >
        <Field
          label="Password baru"
          type="password"
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />
        <Field
          label="Ulangi password baru"
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        {mutation.isError && (
          <div className="text-sm text-sale">
            <p>{getErrorMessage(mutation.error)}</p>
            <Link href="/forgot-password" className="mt-1 inline-block underline">
              Minta tautan baru
            </Link>
          </div>
        )}

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Menyimpan..." : "Simpan Password"}
        </Button>
      </form>
    </>
  );
}