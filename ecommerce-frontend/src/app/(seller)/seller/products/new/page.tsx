"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NeedStore } from "@/components/seller/NeedStore";
import { ProductForm } from "@/components/seller/ProductForm";
import { getErrorMessage } from "@/lib/errors";
import { createSellerProduct } from "@/services/product.service";
import { getMyStore } from "@/services/store.service";

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: store, isLoading } = useQuery({
    queryKey: ["seller-store"],
    queryFn: getMyStore,
    retry: false,
  });

  const create = useMutation({
    mutationFn: createSellerProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      // Langsung ke halaman edit supaya gambar bisa diunggah
      router.push(`/seller/products/${product.id}`);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (isLoading) {
    return <p className="text-sm text-black/50">Memuat...</p>;
  }

  if (store === null) {
    return <NeedStore />;
  }

  return (
    <div className="max-w-xl">
      <Link href="/seller/products" className="text-sm text-black/50 hover:text-black">
        ← Kembali ke produk
      </Link>
      <h1 className="mt-3 font-display text-2xl md:text-3xl">PRODUK BARU</h1>
      <p className="mt-2 text-sm text-black/60">
        Produk baru berstatus &quot;Menunggu review&quot; dan baru tampil di katalog
        setelah disetujui admin.
      </p>

      <div className="mt-6">
        <ProductForm
          submitLabel="Simpan Produk"
          isPending={create.isPending}
          error={error}
          onSubmit={(payload) => {
            setError(null);
            create.mutate(payload);
          }}
        />
      </div>
    </div>
  );
}