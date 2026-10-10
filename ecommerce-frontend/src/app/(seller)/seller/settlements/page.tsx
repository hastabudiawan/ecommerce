"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/components/product/Pagination";
import { NeedStore } from "@/components/seller/NeedStore";
import { cn, formatDate, formatRupiah } from "@/lib/utils";
import { getSettlements, getSettlementSummary } from "@/services/settlement.service";
import { getMyStore } from "@/services/store.service";
import type { SettlementStatus } from "@/types/api";

const PAGE_SIZE = 10;

const STATUS: Record<SettlementStatus, { label: string; className: string }> = {
  PENDING: { label: "Menunggu pencairan", className: "bg-star/20 text-black" },
  RELEASED: { label: "Dicairkan", className: "bg-success/15 text-success" },
};

export default function SellerSettlementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["seller-store"],
    queryFn: getMyStore,
    retry: false,
  });

  // Status settlement diubah admin di luar halaman ini, jadi selalu ambil ulang.
  const { data: summary } = useQuery({
    queryKey: ["settlement-summary"],
    queryFn: getSettlementSummary,
    enabled: !!store,
    staleTime: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["seller-settlements", page],
    queryFn: () => getSettlements({ page: page - 1, size: PAGE_SIZE }),
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
      <h1 className="font-display text-2xl md:text-3xl">SETTLEMENT</h1>
      <p className="mt-2 text-sm text-black/60">
        Settlement dibuat otomatis saat pesanan ditandai Selesai, dan dicairkan
        oleh admin. Ini pencatatan pendapatan, belum ada transfer uang sungguhan.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/10 p-5">
          <p className="text-sm text-black/60">Menunggu pencairan</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatRupiah(summary?.totalPending ?? 0)}
          </p>
        </div>
        <div className="rounded-2xl border border-black/10 p-5">
          <p className="text-sm text-black/60">Sudah dicairkan</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatRupiah(summary?.totalReleased ?? 0)}
          </p>
        </div>
      </div>

      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat settlement...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">
            Belum ada settlement. Tandai pesanan sebagai Selesai untuk membuatnya.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {data?.content.map((settlement) => {
          const { label, className } = STATUS[settlement.status];

          return (
            <div
              key={settlement.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-black/10 p-4 md:p-5"
            >
              <div>
                <p className="font-medium">{settlement.orderNumber}</p>
                <p className="text-sm text-black/50">
                  Dibuat {formatDate(settlement.createdAt)}
                </p>
                {settlement.releasedAt && (
                  <p className="text-sm text-black/50">
                    Dicairkan {formatDate(settlement.releasedAt)}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="font-semibold">{formatRupiah(settlement.amount)}</p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium",
                    className,
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onChange={(next) => router.push(`/seller/settlements?page=${next}`)}
        />
      )}
    </div>
  );
}