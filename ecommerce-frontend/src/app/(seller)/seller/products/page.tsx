"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, Plus } from "lucide-react";
import { Pagination } from "@/components/product/Pagination";
import { NeedStore } from "@/components/seller/NeedStore";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { formatRupiah } from "@/lib/utils";
import { getMyProducts } from "@/services/product.service";
import { getMyStore } from "@/services/store.service";

const PAGE_SIZE = 10;

export default function SellerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["seller-store"],
    queryFn: getMyStore,
    retry: false,
  });

  // Status review bisa berubah di luar halaman ini (admin approve/reject),
  // jadi selalu ambil ulang saat halaman dibuka.
  const { data, isLoading } = useQuery({
    queryKey: ["seller-products", page],
    queryFn: () => getMyProducts({ page: page - 1, size: PAGE_SIZE }),
    enabled: !!store,
    staleTime: 0,
  });

  if (storeLoading) {
    return <p className="text-sm text-black/50">Memuat...</p>;
  }

  if (store === null) {
    return <NeedStore />;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl md:text-3xl">PRODUK SAYA</h1>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={16} /> Tambah Produk
        </Link>
      </div>

      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat produk...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">Belum ada produk. Tambahkan produk pertamamu.</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {data?.content.map((product) => {
          const image = product.images.find((img) => img.isPrimary) ?? product.images[0];

          return (
            <Link
              key={product.id}
              href={`/seller/products/${product.id}`}
              className="flex gap-4 rounded-2xl border border-black/10 p-4 transition hover:border-black/30"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-card">
                {image ? (
                  <Image
                    src={image.imageUrl}
                    alt={product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-black/20">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-medium">{product.name}</p>
                  <ProductStatusBadge status={product.status} />
                </div>
                <p className="mt-1 text-sm text-black/60">
                  {formatRupiah(product.price)} · Stok {product.stock}
                </p>
                {product.status === "REJECTED" && product.rejectionReason && (
                  <p className="mt-2 rounded-lg bg-sale-bg px-3 py-2 text-sm text-sale">
                    Alasan penolakan: {product.rejectionReason}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onChange={(next) => router.push(`/seller/products?page=${next}`)}
        />
      )}
    </div>
  );
}