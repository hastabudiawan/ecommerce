"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { OrderProgress } from "@/components/order/OrderProgress";
import { StatusBadge } from "@/components/order/StatusBadge";
import { Container } from "@/components/ui/Container";
import { formatDate, formatRupiah } from "@/lib/utils";
import { getOrder } from "@/services/order.service";

function OrderDetailContent({ id }: { id: number }) {
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: Number.isInteger(id),
    retry: false,
    staleTime: 0,
  });

  if (isLoading) {
    return <p className="mt-8 text-sm text-black/50">Memuat pesanan...</p>;
  }

  if (isError || !order) {
    return (
      <div className="mt-10 rounded-2xl border border-black/10 p-10 text-center">
        <p className="text-black/60">
          Pesanan tidak ditemukan atau bukan milik kamu.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-block rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-2xl border border-black/10 p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-black/50">No. Pesanan</p>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-black/50">{formatDate(order.createdAt)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          {order.status !== "CANCELLED" && (
            <div className="mt-6">
              <OrderProgress status={order.status} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 p-4 md:p-6">
          <p className="flex items-center gap-2 text-sm text-black/50">
            <Store size={16} />
            {order.storeName ?? "Platform"}
          </p>

          <ul className="mt-3 divide-y divide-black/10">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-black/50">
                    {formatRupiah(item.priceSnapshot)} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatRupiah(item.subtotal)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-2xl border border-black/10 p-4 md:p-6">
          <h2 className="font-semibold">Alamat Pengiriman</h2>
          <p className="mt-3 font-medium">{order.recipientName}</p>
          <p className="mt-1 text-sm text-black/60">{order.shippingAddress}</p>
        </section>

        <section className="rounded-2xl border border-black/10 p-4 md:p-6">
          <h2 className="font-semibold">Ringkasan</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-black/60">Subtotal</dt>
              <dd>{formatRupiah(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-black/60">Ongkos kirim</dt>
              <dd>{formatRupiah(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-base">
              <dt>Total</dt>
              <dd className="font-semibold">{formatRupiah(order.total)}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  );
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">
        Home {" > "}
        <Link href="/orders" className="hover:underline">
          Pesanan Saya
        </Link>{" "}
        {" > "} Detail
      </p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">DETAIL PESANAN</h1>

      <RequireAuth>
        <OrderDetailContent id={Number(id)} />
      </RequireAuth>
    </Container>
  );
}