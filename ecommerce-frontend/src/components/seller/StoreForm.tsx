"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { getErrorMessage } from "@/lib/errors";
import { storeSchema, type StoreFormValues } from "@/lib/validation/seller";
import { createStore } from "@/services/store.service";
import type { SellerStore } from "@/types/api";

export function StoreForm({ onCreated }: { onCreated: (store: SellerStore) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({ resolver: zodResolver(storeSchema) });

  const mutation = useMutation({ mutationFn: createStore, onSuccess: onCreated });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate({
          storeName: values.storeName.trim(),
          city: values.city?.trim() || undefined,
          description: values.description?.trim() || undefined,
        }),
      )}
      className="space-y-4"
    >
      <Field
        label="Nama toko"
        {...register("storeName")}
        error={errors.storeName?.message}
      />
      <Field label="Kota" {...register("city")} error={errors.city?.message} />
      <TextArea
        label="Deskripsi toko"
        {...register("description")}
        error={errors.description?.message}
      />

      {mutation.isError && (
        <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Membuat toko..." : "Buat Toko"}
      </Button>
    </form>
  );
}