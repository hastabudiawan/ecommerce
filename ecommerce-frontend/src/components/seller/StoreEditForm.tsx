"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { getErrorMessage } from "@/lib/errors";
import { storeEditSchema, type StoreEditFormValues } from "@/lib/validation/seller";
import { updateMyStore } from "@/services/store.service";
import type { SellerStore } from "@/types/api";

interface StoreEditFormProps {
  store: SellerStore;
  onSaved: (store: SellerStore) => void;
  onCancel: () => void;
}

export function StoreEditForm({ store, onSaved, onCancel }: StoreEditFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreEditFormValues>({
    resolver: zodResolver(storeEditSchema),
    defaultValues: {
      storeName: store.storeName,
      city: store.city ?? "",
      description: store.description ?? "",
      shippingFee: String(store.shippingFee),
    },
  });

  const mutation = useMutation({ mutationFn: updateMyStore, onSuccess: onSaved });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate({
          storeName: values.storeName.trim(),
          city: values.city?.trim() || undefined,
          description: values.description?.trim() || undefined,
          shippingFee: Number(values.shippingFee),
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
      <div>
        <Field
          label="Ongkos kirim per pesanan (Rp)"
          inputMode="numeric"
          {...register("shippingFee")}
          error={errors.shippingFee?.message}
        />
        <p className="mt-1 text-xs text-black/50">
          Tarif tetap yang dikenakan pada setiap pesanan dari tokomu. Isi 0 untuk
          gratis ongkir.
        </p>
      </div>

      {mutation.isError && (
        <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  );
}