"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/errors";
import { profileSchema, type ProfileFormValues } from "@/lib/validation/account";
import { updateProfile } from "@/services/account.service";
import { useAuthStore } from "@/store/auth.store";
import type { Account } from "@/types/api";

export function ProfileForm({ account }: { account: Account }) {
  const queryClient = useQueryClient();
  const { token, user, setAuth } = useAuthStore();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: account.name, phone: account.phone ?? "" },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      queryClient.setQueryData(["me", updated.id], updated);
      // Nama di Navbar ikut berubah seketika
      if (token && user) {
        setAuth(token, { ...user, name: updated.name });
      }
      setSaved(true);
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        setSaved(false);
        mutation.mutate({
          name: values.name.trim(),
          phone: values.phone?.trim() || undefined,
        });
      })}
      className="space-y-4"
    >
      <Field label="Email" value={account.email} readOnly disabled />
      <Field label="Nama" {...register("name")} error={errors.name?.message} />
      <Field label="No. HP" {...register("phone")} error={errors.phone?.message} />

      {mutation.isError && (
        <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
      )}
      {saved && <p className="text-sm text-success">Profil tersimpan.</p>}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}