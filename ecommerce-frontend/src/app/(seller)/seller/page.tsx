"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { StoreForm } from "@/components/seller/StoreForm";
import { getMyStore } from "@/services/store.service";
import type { SellerStore } from "@/types/api";

export default function SellerStorePage() {
  const queryClient = useQueryClient();

  const { data: store, isLoading, isError } = useQuery({
    queryKey: ["seller-store"],
    queryFn: getMyStore,
    retry: false,
  });

  if (isLoading) {
    return <p className="text-sm text-black/50">Memuat...</p>;
  }

  if (isError) {
    return <p className="text-sm text-sale">Gagal memuat data toko.</p>;
  }

  if (store === null) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-2xl md:text-3xl">BUAT TOKO</h1>
        <p className="mt-2 text-black/60">
          Kamu belum punya toko. Buat toko dulu untuk mulai menjual produk.
        </p>
        <div className="mt-6">
          <StoreForm
            onCreated={(created: SellerStore) =>
              queryClient.setQueryData(["seller-store"], created)
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">TOKO SAYA</h1>

      <div className="mt-6 max-w-xl rounded-2xl border border-black/10 p-6">
        <h2 className="text-xl font-semibold">{store?.storeName}</h2>
        {store?.city && (
          <p className="mt-2 flex items-center gap-2 text-sm text-black/60">
            <MapPin size={16} />
            {store.city}
          </p>
        )}
        {store?.description && <p className="mt-4 text-black/60">{store.description}</p>}
        <p className="mt-4 text-xs text-black/40">Slug: {store?.slug}</p>

        <Link
          href="/seller/products"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Kelola Produk
        </Link>
      </div>
    </div>
  );
}