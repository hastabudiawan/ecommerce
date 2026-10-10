"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Pagination } from "@/components/product/Pagination";
import { Button } from "@/components/ui/Button";
import { useListParams } from "@/hooks/useListParams";
import { getErrorMessage } from "@/lib/errors";
import { cn, formatDate, formatRupiah } from "@/lib/utils";
import { getSettlementsForAdmin, releaseSettlement } from "@/services/settlement.service";
import type { Settlement, SettlementStatus } from "@/types/api";

const PAGE_SIZE = 10;

const TABS = [
  { value: "PENDING", label: "Menunggu pencairan" },
  { value: "RELEASED", label: "Dicairkan" },
  { value: "ALL", label: "Semua" },
];

const STATUS: Record<SettlementStatus, { label: string; className: string }> = {
  PENDING: { label: "Menunggu pencairan", className: "bg-star/20 text-black" },
  RELEASED: { label: "Dicairkan", className: "bg-success/15 text-success" },
};

export default function AdminSettlementsPage() {
  const queryClient = useQueryClient();
  const { status, page, setStatus, setPage } = useListParams(
    "PENDING",
    TABS.map((tab) => tab.value),
  );
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settlements", status, page],
    queryFn: () =>
      getSettlementsForAdmin({
        status: status === "ALL" ? undefined : (status as SettlementStatus),
        page: page - 1,
        size: PAGE_SIZE,
      }),
    staleTime: 0,
  });

  const release = useMutation({
    mutationFn: releaseSettlement,
    onSuccess: () => {
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["admin-settlements"] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleRelease(settlement: Settlement) {
    const message = `Cairkan ${formatRupiah(settlement.amount)} untuk ${settlement.storeName}?\n\nIni hanya menandai settlement sebagai dicairkan, bukan transfer uang sungguhan.`;
    if (!window.confirm(message)) return;

    setError(null);
    release.mutate(settlement.id);
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">SETTLEMENT</h1>
      <p className="mt-2 text-sm text-black/60">
        Settlement dibuat otomatis saat pesanan toko ditandai Selesai. Mencairkan
        berarti menandainya sebagai sudah dibayarkan ke penjual.
      </p>

      <div className="mt-6">
        <StatusTabs options={TABS} value={status} onChange={setStatus} />
      </div>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat settlement...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">
            {status === "PENDING"
              ? "Tidak ada settlement yang menunggu pencairan."
              : "Tidak ada settlement pada filter ini."}
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
                <p className="font-medium">{settlement.storeName}</p>
                <p className="text-sm text-black/50">{settlement.orderNumber}</p>
                <p className="text-sm text-black/50">
                  Dibuat {formatDate(settlement.createdAt)}
                </p>
                {settlement.releasedAt && (
                  <p className="text-sm text-black/50">
                    Dicairkan {formatDate(settlement.releasedAt)}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold">{formatRupiah(settlement.amount)}</p>
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 text-xs font-medium",
                    className,
                  )}
                >
                  {label}
                </span>
                {settlement.status === "PENDING" && (
                  <Button
                    className="px-6 py-3"
                    disabled={release.isPending}
                    onClick={() => handleRelease(settlement)}
                  >
                    {release.isPending && release.variables === settlement.id
                      ? "Memproses..."
                      : "Cairkan"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      )}
    </div>
  );
}