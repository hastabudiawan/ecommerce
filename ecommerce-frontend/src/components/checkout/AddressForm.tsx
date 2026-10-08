"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/errors";
import { addressSchema, type AddressFormValues } from "@/lib/validation/address";
import { createAddress } from "@/services/address.service";
import type { Address } from "@/types/api";

interface AddressFormProps {
  onCreated: (address: Address) => void;
  onCancel?: () => void;
}

export function AddressForm({ onCreated, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  });

  const mutation = useMutation({
    mutationFn: createAddress,
    onSuccess: onCreated,
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="mt-4 space-y-4 rounded-2xl border border-black/10 p-4 md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nama penerima"
          {...register("recipientName")}
          error={errors.recipientName?.message}
        />
        <Field label="No. HP" {...register("phone")} error={errors.phone?.message} />
      </div>

      <Field
        label="Alamat lengkap"
        {...register("addressLine")}
        error={errors.addressLine?.message}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Kota" {...register("city")} error={errors.city?.message} />
        <Field
          label="Provinsi"
          {...register("province")}
          error={errors.province?.message}
        />
        <Field
          label="Kode pos"
          {...register("postalCode")}
          error={errors.postalCode?.message}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isDefault")} />
        Jadikan alamat utama
      </label>

      {mutation.isError && (
        <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Menyimpan..." : "Simpan Alamat"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}