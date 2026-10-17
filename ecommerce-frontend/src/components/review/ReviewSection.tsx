"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { StarRating } from "@/components/product/StarRating";
import { ReviewForm } from "@/components/review/ReviewForm";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import { formatDay } from "@/lib/utils";
import { deleteReview, getReviewEligibility, getReviews } from "@/services/review.service";
import { useAuthStore } from "@/store/auth.store";
import type { Product } from "@/types/api";

const PAGE_SIZE = 5;

export function ReviewSection({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: reviewPages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["reviews", product.id],
    queryFn: ({ pageParam }) =>
      getReviews({ productId: product.id, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.last ? undefined : last.page + 1),
  });

  // Hanya untuk pengguna yang sudah login: apakah boleh mengulas, atau ulasannya sendiri
  const { data: status } = useQuery({
    queryKey: ["review-status", product.id, user?.userId],
    queryFn: () => getReviewEligibility(product.id),
    enabled: !!user,
    staleTime: 0,
  });

  function refreshAll() {
    setError(null);
    setEditing(false);
    queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
    queryClient.invalidateQueries({ queryKey: ["review-status", product.id] });
    // Rata-rata rating ikut berubah di halaman ini dan di kartu produk
    queryClient.invalidateQueries({ queryKey: ["product", product.slug] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const remove = useMutation({
    mutationFn: deleteReview,
    onSuccess: refreshAll,
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleDelete(id: number) {
    if (!window.confirm("Hapus ulasan ini?")) return;
    setError(null);
    remove.mutate(id);
  }

  const reviews = reviewPages?.pages.flatMap((page) => page.content) ?? [];
  const isAdmin = user?.role === "ADMIN";
  const myReviewId = status?.myReview?.id;

  return (
    <section id="ulasan" className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
        <h2 className="text-xl font-semibold">
          Ulasan <span className="text-base font-normal text-black/50">({product.reviewCount})</span>
        </h2>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={product.ratingAverage} />
            <span className="text-sm text-black/60">{product.ratingAverage.toFixed(1)}/5</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        {!user && (
          <p className="text-sm text-black/60">
            <Link href="/login" className="underline">
              Masuk
            </Link>{" "}
            untuk menulis ulasan. Ulasan hanya bisa ditulis oleh pembeli produk ini.
          </p>
        )}

        {user && status?.canReview && !editing && (
          <ReviewForm productId={product.id} onDone={refreshAll} />
        )}

        {user && status && !status.canReview && !status.myReview && status.reason && (
          <p className="text-sm text-black/60">{status.reason}.</p>
        )}

        {user && status?.myReview && editing && (
          <ReviewForm
            productId={product.id}
            existing={status.myReview}
            onDone={refreshAll}
            onCancel={() => setEditing(false)}
          />
        )}
      </div>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat ulasan...</p>}

      {!isLoading && reviews.length === 0 && (
        <p className="mt-6 text-sm text-black/50">Belum ada ulasan untuk produk ini.</p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {reviews.map((review) => {
          const isMine = review.id === myReviewId;

          return (
            <article key={review.id} className="rounded-2xl border border-black/10 p-5">
              <StarRating value={review.rating} />
              <p className="mt-3 flex items-center gap-1.5 font-semibold">
                {review.authorName}
                <BadgeCheck
                  size={18}
                  className="text-success"
                  aria-label="Pembeli terverifikasi"
                />
                {isMine && <span className="text-xs font-normal text-black/40">(ulasanmu)</span>}
              </p>
              {review.comment && (
                <p className="mt-2 text-sm text-black/60">{review.comment}</p>
              )}
              <p className="mt-4 text-sm text-black/50">
                Ditulis pada {formatDay(review.createdAt)}
              </p>

              {(isMine || isAdmin) && (
                <div className="mt-3 flex gap-4 text-sm">
                  {isMine && (
                    <button
                      className="underline disabled:opacity-50"
                      disabled={editing}
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="text-sale underline disabled:opacity-50"
                    disabled={remove.isPending}
                    onClick={() => handleDelete(review.id)}
                  >
                    Hapus
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            className="px-10 py-3.5"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? "Memuat..." : "Muat lebih banyak"}
          </Button>
        </div>
      )}
    </section>
  );
}