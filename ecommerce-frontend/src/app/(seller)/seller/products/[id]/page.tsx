"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageManager } from "@/components/seller/ImageManager";
import { NeedStore } from "@/components/seller/NeedStore";
import { ProductForm } from "@/components/seller/ProductForm";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { getErrorMessage } from "@/lib/errors";
import { getProductById, updateSellerProduct } from "@/services/product.service";
import { getMyStore } from "@/services/store.service";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const id = Number(rawId);

  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["seller-store"],
    queryFn: getMyStore,
    retry: false,
  });

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["seller-product", id],
    queryFn: () => getProductById(id),
    enabled: Number.isInteger(id),
    retry: false,
    staleTime: 0,
  });

  const update = useMutation({
    mutationFn: updateSellerProduct,
    onSuccess: (updated) => {
      queryClient.setQueryData(["seller-product", id], updated);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      setSaved(true);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (storeLoading || productLoading) {
    return <p className="text-sm text-black/50">Memuat...</p>;
  }

  if (store === null) {
    return <NeedStore />;
  }

  // Endpoint GET produk bersifat publik, jadi halaman ini yang memastikan
  // produknya memang milik toko seller yang sedang login.
  if (!product || product.storeId !== store?.id) {
    return (
      <div className="rounded-2xl border border-black/10 p-10 text-center">
        <p className="text-black/60">Produk tidak ditemukan atau bukan milik tokomu.</p>
        <Link
          href="/seller/products"
          className="mt-6 inline-block rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Kembali ke Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/seller/products" className="text-sm text-black/50 hover:text-black">
        ← Kembali ke produk
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl md:text-3xl">{product.name}</h1>
        <ProductStatusBadge status={product.status} />
      </div>

      {product.status === "PENDING" && (
        <p className="mt-3 rounded-lg bg-surface px-4 py-3 text-sm text-black/70">
          Produk ini menunggu persetujuan admin dan belum tampil di katalog.
        </p>
      )}
      {product.status === "REJECTED" && (
        <p className="mt-3 rounded-lg bg-sale-bg px-4 py-3 text-sm text-sale">
          Ditolak: {product.rejectionReason}. Perbaiki lalu simpan, produk akan
          diajukan ulang untuk direview.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Gambar Produk</h2>
        <div className="mt-3">
          <ImageManager product={product} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Detail Produk</h2>
        <div className="mt-3">
          <ProductForm
            initial={product}
            submitLabel="Simpan Perubahan"
            isPending={update.isPending}
            error={error}
            onSubmit={(payload) => {
              setError(null);
              setSaved(false);
              update.mutate({ id, payload });
            }}
          />
          {saved && <p className="mt-3 text-sm text-success">Perubahan tersimpan.</p>}
        </div>
      </section>
    </div>
  );
}