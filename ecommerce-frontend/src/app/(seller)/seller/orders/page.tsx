"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/product/Pagination";
import { SellerOrderCard } from "@/components/seller/SellerOrderCard";
import { getErrorMessage } from "@/lib/errors";
import { getSellerOrders, updateSellerOrderStatus } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/api";

const PAGE_SIZE = 10;

export default function SellerOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const page = Number(searchParams.get("page") ?? "1");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders", page],
    queryFn: () => getSellerOrders({ page: page - 1, size: PAGE_SIZE }),
    staleTime: 0,
  });

  const updateStatus = useMutation({
    mutationFn: updateSellerOrderStatus,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      // Menandai COMPLETED membuat settlement baru di backend,
      // jadi halaman settlement harus diambil ulang juga.
      queryClient.invalidateQueries({ queryKey: ["seller-settlements"] });
      queryClient.invalidateQueries({ queryKey: ["settlement-summary"] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleAdvance(order: Order, status: OrderStatus, label: string) {
    const extra =
      status === "COMPLETED"
        ? "\n\nSettlement untuk pesanan ini akan dibuat otomatis."
        : "";

    if (!window.confirm(`Ubah pesanan ${order.orderNumber}: "${label}"?${extra}`)) {
      return;
    }

    setError(null);
    updateStatus.mutate({ orderId: order.id, status });
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">PESANAN MASUK</h1>
      <p className="mt-2 text-sm text-black/60">
        Alur: Menunggu → Dibayar → Dikirim → Selesai. Pembayaran online belum
        tersedia, jadi konfirmasi pembayaran dilakukan manual olehmu.
      </p>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}

      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat pesanan...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">Belum ada pesanan masuk untuk tokomu.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data?.content.map((order) => (
          <SellerOrderCard
            key={order.id}
            order={order}
            disabled={updateStatus.isPending}
            updating={
              updateStatus.isPending && updateStatus.variables?.orderId === order.id
            }
            onAdvance={(status, label) => handleAdvance(order, status, label)}
          />
        ))}
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onChange={(next) => router.push(`/seller/orders?page=${next}`)}
        />
      )}
    </div>
  );
}