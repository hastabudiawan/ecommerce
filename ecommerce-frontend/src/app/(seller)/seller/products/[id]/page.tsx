"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageManager } from "@/components/seller/ImageManager";
import { NeedStore } from "@/components/seller/NeedStore";
import { ProductForm } from "@/components/seller/ProductForm";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import {
  archiveProduct,
  getProductById,
  restoreProduct,
  updateSellerProduct,
} from "@/services/product.service";
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

  function applyUpdated(updated: NonNullable<typeof product>) {
    setError(null);
    queryClient.setQueryData(["seller-product", id], updated);
    queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    // Mengarsipkan atau mengubah konten mengubah isi katalog publik
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const update = useMutation({
    mutationFn: updateSellerProduct,
    onSuccess: (updated) => {
      applyUpdated(updated);
      setSaved(true);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const archive = useMutation({
    mutationFn: archiveProduct,
    onSuccess: applyUpdated,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const restore = useMutation({
    mutationFn: restoreProduct,
    onSuccess: applyUpdated,
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (storeLoading || productLoading) {
    return <p className="text-sm text-black/50">Memuat...</p>;
  }

  if (store === null) {
    return <NeedStore />;
  }

  // Endpoint produk mengizinkan pemilik toko melihat produknya walau belum disetujui,
  // tapi halaman ini tetap memastikan produknya memang milik toko yang sedang login.
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

  const isArchived = product.status === "ARCHIVED";
  const busy = update.isPending || archive.isPending || restore.isPending;

  function handleArchive() {
    if (
      !window.confirm(
        "Arsipkan produk ini? Produk hilang dari katalog dan tidak bisa dibeli. Pesanan yang sudah ada tidak terpengaruh. Kamu bisa mengaktifkannya lagi nanti (dengan review ulang).",
      )
    ) {
      return;
    }
    setError(null);
    archive.mutate(product!.id);
  }

  function handleRestore() {
    if (
      !window.confirm(
        "Aktifkan kembali produk ini? Produk akan masuk antrean review dulu sebelum tampil di katalog.",
      )
    ) {
      return;
    }
    setError(null);
    restore.mutate(product!.id);
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
      {product.status === "APPROVED" && (
        <p className="mt-3 rounded-lg bg-surface px-4 py-3 text-sm text-black/70">
          Mengubah nama, deskripsi, kategori, atau menambah gambar akan mengirim
          produk kembali ke antrean review, dan produk tidak tampil di katalog
          sampai disetujui lagi. Mengubah harga, diskon, atau stok tidak memerlukan review.
        </p>
      )}
      {isArchived && (
        <p className="mt-3 rounded-lg bg-surface px-4 py-3 text-sm text-black/70">
          Produk ini diarsipkan: tidak tampil di katalog dan tidak bisa dibeli.
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

      <section className="mt-10 border-t border-black/10 pt-6">
        <h2 className="text-lg font-semibold">Arsip</h2>
        {isArchived ? (
          <>
            <p className="mt-2 text-sm text-black/60">
              Aktifkan kembali untuk menjual produk ini lagi. Produk akan melewati
              review admin terlebih dulu.
            </p>
            <Button className="mt-4 px-6 py-3" disabled={busy} onClick={handleRestore}>
              {restore.isPending ? "Memproses..." : "Aktifkan Lagi"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-black/60">
              Produk yang pernah dipesan tidak bisa dihapus permanen. Arsipkan untuk
              menyembunyikannya dari katalog.
            </p>
            <Button
              variant="outline"
              className="mt-4 px-6 py-3 text-sale"
              disabled={busy}
              onClick={handleArchive}
            >
              {archive.isPending ? "Memproses..." : "Arsipkan Produk"}
            </Button>
          </>
        )}
      </section>
    </div>
  );
}