"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import { cancelOrder, confirmOrder } from "@/services/order.service";
import type { Order } from "@/types/api";

export function OrderActions({ order }: { order: Order }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  function handleSuccess(updated: Order) {
    setError(null);
    queryClient.setQueryData(["order", updated.id], updated);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    // Pembatalan mengembalikan stok produk
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const cancel = useMutation({
    mutationFn: cancelOrder,
    onSuccess: handleSuccess,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const receive = useMutation({
    mutationFn: confirmOrder,
    onSuccess: handleSuccess,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const busy = cancel.isPending || receive.isPending;

  function handleCancel() {
    if (!window.confirm("Batalkan pesanan ini? Pesanan tidak bisa dilanjutkan lagi.")) return;
    setError(null);
    cancel.mutate(order.id);
  }

  function handleReceive() {
    if (!window.confirm("Konfirmasi bahwa pesanan sudah kamu terima?")) return;
    setError(null);
    receive.mutate(order.id);
  }

  if (order.status === "PENDING") {
    return (
      <div>
        <Button
          variant="outline"
          className="px-6 py-3 text-sale"
          disabled={busy}
          onClick={handleCancel}
        >
          {cancel.isPending ? "Memproses..." : "Batalkan Pesanan"}
        </Button>
        {error && <p className="mt-3 text-sm text-sale">{error}</p>}
      </div>
    );
  }

  if (order.status === "PAID") {
    return (
      <p className="text-sm text-black/50">
        Pesanan sudah dibayar. Untuk membatalkannya, hubungi penjual.
      </p>
    );
  }

  if (order.status === "SHIPPED") {
    return (
      <div>
        <Button className="px-6 py-3" disabled={busy} onClick={handleReceive}>
          {receive.isPending ? "Memproses..." : "Pesanan Diterima"}
        </Button>
        <p className="mt-2 text-sm text-black/50">
          Konfirmasi setelah barang sampai. Jika tidak dikonfirmasi, pesanan
          otomatis selesai dalam beberapa hari.
        </p>
        {error && <p className="mt-3 text-sm text-sale">{error}</p>}
      </div>
    );
  }

  return null;
}