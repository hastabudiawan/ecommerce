"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/product/Pagination";
import { SellerOrderCard } from "@/components/seller/SellerOrderCard";
import { getErrorMessage } from "@/lib/errors";
import { SELLER_ACTIONS, type OrderAction } from "@/lib/order-status";
import { getSellerOrders, updateSellerOrderStatus } from "@/services/order.service";
import type { Order } from "@/types/api";

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
      // Pembatalan mengembalikan stok, jadi data produk (toko dan dashboard) ikut diambil ulang
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleAction(order: Order, action: OrderAction) {
    const extra =
      action.next === "CANCELLED"
        ? "\n\nStok produk akan dikembalikan dan pesanan tidak bisa dilanjutkan lagi."
        : "";

    if (!window.confirm(`Ubah pesanan ${order.orderNumber}: "${action.label}"?${extra}`)) {
      return;
    }

    setError(null);
    updateStatus.mutate({ orderId: order.id, status: action.next });
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">PESANAN MASUK</h1>
      <p className="mt-2 text-sm text-black/60">
        Alur: Menunggu → Dibayar → Dikirim → Selesai. Pembayaran online belum
        tersedia, jadi konfirmasi pembayaran dilakukan manual olehmu. Pesanan
        dinyatakan Selesai oleh pembeli, atau otomatis jika pembeli tidak
        mengonfirmasi dalam beberapa hari setelah dikirim.
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
            actions={SELLER_ACTIONS[order.status]}
            note={
              order.status === "SHIPPED"
                ? "Menunggu konfirmasi pembeli. Pesanan otomatis selesai jika pembeli tidak mengonfirmasi dalam beberapa hari."
                : undefined
            }
            disabled={updateStatus.isPending}
            updatingStatus={
              updateStatus.isPending && updateStatus.variables?.orderId === order.id
                ? updateStatus.variables.status
                : null
            }
            onAction={(action) => handleAction(order, action)}
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