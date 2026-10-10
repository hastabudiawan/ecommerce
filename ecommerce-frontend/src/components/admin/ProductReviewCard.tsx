"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { formatDate, formatRupiah } from "@/lib/utils";
import type { Product } from "@/types/api";

interface ProductReviewCardProps {
  product: Product;
  busy: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function ProductReviewCard({
  product,
  busy,
  onApprove,
  onReject,
}: ProductReviewCardProps) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  function submitReject() {
    if (!reason.trim()) {
      setReasonError("Alasan penolakan wajib diisi");
      return;
    }
    onReject(reason.trim());
    setRejecting(false);
    setReason("");
    setReasonError(null);
  }

  return (
    <div className="rounded-2xl border border-black/10 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-black/50">
            {product.storeName ?? "Platform"} · {product.categoryName} ·{" "}
            {formatDate(product.createdAt)}
          </p>
        </div>
        <ProductStatusBadge status={product.status} />
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-black/60">
        {product.description || "Tanpa deskripsi."}
      </p>
      <p className="mt-2 text-sm">
        {formatRupiah(product.price)} · Stok {product.stock}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {product.images.length === 0 ? (
          <p className="text-sm text-sale">Belum ada gambar</p>
        ) : (
          product.images.map((image) => (
            <div
              key={image.id}
              className="relative h-16 w-16 overflow-hidden rounded-lg bg-card"
            >
              <Image
                src={image.imageUrl}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ))
        )}
      </div>

      {product.status === "REJECTED" && product.rejectionReason && (
        <p className="mt-3 rounded-lg bg-sale-bg px-3 py-2 text-sm text-sale">
          Alasan penolakan: {product.rejectionReason}
        </p>
      )}

      {rejecting ? (
        <div className="mt-4 space-y-3">
          <TextArea
            label="Alasan penolakan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={reasonError ?? undefined}
          />
          <div className="flex gap-3">
            <Button className="px-6 py-3" disabled={busy} onClick={submitReject}>
              Kirim Penolakan
            </Button>
            <Button
              variant="outline"
              className="px-6 py-3"
              onClick={() => {
                setRejecting(false);
                setReasonError(null);
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {product.status !== "APPROVED" && (
            <Button className="px-6 py-3" disabled={busy} onClick={onApprove}>
              Setujui
            </Button>
          )}
          {product.status !== "REJECTED" && (
            <Button
              variant="outline"
              className="px-6 py-3"
              disabled={busy}
              onClick={() => setRejecting(true)}
            >
              Tolak
            </Button>
          )}
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="text-sm underline"
          >
            Lihat halaman produk
          </Link>
        </div>
      )}
    </div>
  );
}