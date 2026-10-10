"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductReviewCard } from "@/components/admin/ProductReviewCard";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Pagination } from "@/components/product/Pagination";
import { useListParams } from "@/hooks/useListParams";
import { getErrorMessage } from "@/lib/errors";
import {
  approveProduct,
  getProductsForAdmin,
  rejectProduct,
} from "@/services/product.service";
import type { Product } from "@/types/api";

const PAGE_SIZE = 10;

const TABS = [
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "ALL", label: "Semua" },
];

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const { status, page, setStatus, setPage } = useListParams(
    "PENDING",
    TABS.map((tab) => tab.value),
  );
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", status, page],
    queryFn: () =>
      getProductsForAdmin({
        status: status === "ALL" ? undefined : (status as Product["status"]),
        page: page - 1,
        size: PAGE_SIZE,
      }),
    staleTime: 0,
  });

  function handleDone() {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    // Menyetujui atau menolak mengubah isi katalog publik
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const approve = useMutation({
    mutationFn: approveProduct,
    onSuccess: handleDone,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const reject = useMutation({
    mutationFn: rejectProduct,
    onSuccess: handleDone,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const busy = approve.isPending || reject.isPending;

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">REVIEW PRODUK</h1>
      <p className="mt-2 text-sm text-black/60">
        Produk dari seller baru tampil di katalog setelah disetujui. Produk yang
        sudah disetujui bisa diturunkan lagi dengan tombol Tolak.
      </p>

      <div className="mt-6">
        <StatusTabs options={TABS} value={status} onChange={setStatus} />
      </div>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat produk...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">
            {status === "PENDING"
              ? "Tidak ada produk yang menunggu review."
              : "Tidak ada produk pada filter ini."}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data?.content.map((product) => (
          <ProductReviewCard
            key={product.id}
            product={product}
            busy={busy}
            onApprove={() => approve.mutate(product.id)}
            onReject={(reason) => reject.mutate({ id: product.id, reason })}
          />
        ))}
      </div>

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      )}
    </div>
  );
}