"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/errors";
import { passwordSchema, type PasswordFormValues } from "@/lib/validation/account";
import { changePassword } from "@/services/account.service";
import { useAuthStore } from "@/store/auth.store";

export function PasswordForm() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      // Token lama sudah dicabut backend. Token baru dipasang supaya sesi ini tetap jalan.
      setAuth(data.token, {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
      });
      reset();
      setDone(true);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        setDone(false);
        mutation.mutate({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
      })}
      className="space-y-4"
    >
      <Field
        label="Password saat ini"
        type="password"
        {...register("currentPassword")}
        error={errors.currentPassword?.message}
      />
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
        <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
      )}
      {done && (
        <p className="text-sm text-success">
          Password berhasil diganti. Perangkat lain tetap login sampai sesinya habis.
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Menyimpan..." : "Ganti Password"}
      </Button>
    </form>
  );
}