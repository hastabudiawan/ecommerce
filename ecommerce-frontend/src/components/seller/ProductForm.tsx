"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { TextArea } from "@/components/ui/TextArea";
import { cn } from "@/lib/utils";
import { productSchema, type ProductFormValues } from "@/lib/validation/seller";
import { getCategories } from "@/services/category.service";
import type { Product, ProductRequest } from "@/types/api";

interface ProductFormProps {
  initial?: Product;
  submitLabel: string;
  isPending: boolean;
  error?: string | null;
  onSubmit: (payload: ProductRequest) => void;
}

export function ProductForm({
  initial,
  submitLabel,
  isPending,
  error,
  onSubmit,
}: ProductFormProps) {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initial?.name ?? "",
      categoryId: initial ? String(initial.categoryId) : "",
      description: initial?.description ?? "",
      price: initial ? String(initial.price) : "",
      stock: initial ? String(initial.stock) : "",
    },
  });

  // Form baru dirender setelah kategori siap, supaya <select> sudah punya opsi
  // saat nilai awalnya dipasang (kalau tidak, kategori produk yang diedit tidak terpilih).
  if (!categories) {
    return <p className="text-sm text-black/50">Memuat form...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          categoryId: Number(values.categoryId),
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          price: Number(values.price),
          stock: Number(values.stock),
        }),
      )}
      className="space-y-4"
    >
      <Field label="Nama produk" {...register("name")} error={errors.name?.message} />

      <label className="block">
        <span className="text-sm font-medium">Kategori</span>
        <select
          {...register("categoryId")}
          className={cn(
            "mt-2 w-full rounded-full border border-black/10 bg-surface px-5 py-3 outline-none focus:border-black/30",
            errors.categoryId && "border-sale",
          )}
        >
          <option value="">Pilih kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span className="mt-1 block text-sm text-sale">{errors.categoryId.message}</span>
        )}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Harga (Rp)"
          inputMode="numeric"
          {...register("price")}
          error={errors.price?.message}
        />
        <Field
          label="Stok"
          inputMode="numeric"
          {...register("stock")}
          error={errors.stock?.message}
        />
      </div>

      <TextArea
        label="Deskripsi"
        {...register("description")}
        error={errors.description?.message}
      />

      {error && <p className="text-sm text-sale">{error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}