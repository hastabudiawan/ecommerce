"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { getErrorMessage } from "@/lib/errors";
import { storeSchema, type StoreFormValues } from "@/lib/validation/seller";
import type { CreateStoreRequest } from "@/types/api";

interface StoreFormProps<T> {
  mutationFn: (payload: CreateStoreRequest) => Promise<T>;
  onSuccess: (result: T) => void;
  submitLabel?: string;
}

export function StoreForm<T>({
  mutationFn,
  onSuccess,
  submitLabel = "Buat Toko",
}: StoreFormProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({ resolver: zodResolver(storeSchema) });

  const mutation = useMutation({ mutationFn, onSuccess });

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
        {mutation.isPending ? "Memproses..." : submitLabel}
      </Button>
    </form>
  );
}