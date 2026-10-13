"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Pagination } from "@/components/product/Pagination";
import { SellerOrderCard } from "@/components/seller/SellerOrderCard";
import { useListParams } from "@/hooks/useListParams";
import { getErrorMessage } from "@/lib/errors";
import { ADMIN_ACTIONS, type OrderAction } from "@/lib/order-status";
import { getOrdersForAdmin, updateOrderStatus } from "@/services/order.service";
import type { Order, OrderStatus } from "@/types/api";

const PAGE_SIZE = 10;

const TABS = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "PAID", label: "Dibayar" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { status, page, setStatus, setPage } = useListParams(
    "ALL",
    TABS.map((tab) => tab.value),
  );
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, page],
    queryFn: () =>
      getOrdersForAdmin({
        status: status === "ALL" ? undefined : (status as OrderStatus),
        page: page - 1,
        size: PAGE_SIZE,
      }),
    staleTime: 0,
  });

  const updateStatus = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
      <h1 className="font-display text-2xl md:text-3xl">SEMUA PESANAN</h1>
      <p className="mt-2 text-sm text-black/60">
        Pesanan milik toko dikelola oleh penjualnya. Kamu memproses pesanan
        produk platform.
      </p>

      <div className="mt-6">
        <StatusTabs options={TABS} value={status} onChange={setStatus} />
      </div>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat pesanan...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">Tidak ada pesanan pada filter ini.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data?.content.map((order) => (
          <SellerOrderCard
            key={order.id}
            order={order}
            storeLabel={order.storeName ?? "Platform"}
            // Hanya pesanan produk platform yang diproses admin; pesanan toko read-only
            actions={order.storeId === null ? ADMIN_ACTIONS[order.status] : undefined}
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
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      )}
    </div>
  );
}