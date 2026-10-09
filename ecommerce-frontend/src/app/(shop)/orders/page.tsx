"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StatusBadge } from "@/components/order/StatusBadge";
import { Pagination } from "@/components/product/Pagination";
import { Container } from "@/components/ui/Container";
import { formatDate, formatRupiah } from "@/lib/utils";
import { getOrders } from "@/services/order.service";

const PAGE_SIZE = 10;

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const { data, isLoading } = useQuery({
    queryKey: ["orders", page],
    queryFn: () => getOrders({ page: page - 1, size: PAGE_SIZE }),
    staleTime: 0,
  });

  if (isLoading) {
    return <p className="mt-8 text-sm text-black/50">Memuat pesanan...</p>;
  }

  if (!data || data.content.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-black/10 p-10 text-center">
        <p className="text-black/60">Kamu belum punya pesanan.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 space-y-4">
        {data.content.map((order) => {
          const first = order.items[0];
          const others = order.items.length - 1;

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border border-black/10 p-4 transition hover:border-black/30 md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 text-sm text-black/50">
                  <Store size={16} />
                  {order.storeName ?? "Platform"}
                </p>
                <StatusBadge status={order.status} />
              </div>

              <p className="mt-3 font-medium">{order.orderNumber}</p>
              <p className="text-sm text-black/50">{formatDate(order.createdAt)}</p>

              <p className="mt-3 text-sm text-black/70">
                {first.productName} × {first.quantity}
                {others > 0 && (
                  <span className="text-black/50"> +{others} produk lainnya</span>
                )}
              </p>

              <div className="mt-4 flex justify-between border-t border-black/10 pt-3">
                <span className="text-sm text-black/60">Total</span>
                <span className="font-semibold">{formatRupiah(order.total)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <Pagination
        page={page}
        totalPages={data.totalPages}
        onChange={(next) => router.push(`/orders?page=${next}`)}
      />
    </>
  );
}

export default function OrdersPage() {
  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">Home {" > "} Pesanan Saya</p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">PESANAN SAYA</h1>

      <RequireAuth>
        <OrdersContent />
      </RequireAuth>
    </Container>
  );
}