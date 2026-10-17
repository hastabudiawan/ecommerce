"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/TextArea";
import { StarInput } from "@/components/product/StarInput";
import { getErrorMessage } from "@/lib/errors";
import { createReview, updateReview } from "@/services/review.service";
import type { Review } from "@/types/api";

interface ReviewFormProps {
  productId: number;
  existing?: Review;
  onDone: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, existing, onDone, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [ratingError, setRatingError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { rating, comment: comment.trim() || undefined };
      return existing
        ? updateReview({ id: existing.id, payload })
        : createReview({ productId, payload });
    },
    onSuccess: onDone,
  });

  function handleSubmit() {
    if (rating === 0) {
      setRatingError("Pilih jumlah bintang dulu");
      return;
    }
    setRatingError(null);
    mutation.mutate();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 p-4 md:p-6">
      <h3 className="font-semibold">{existing ? "Edit ulasanmu" : "Tulis ulasan"}</h3>

      <div>
        <StarInput value={rating} onChange={setRating} />
        {ratingError && <p className="mt-1 text-sm text-sale">{ratingError}</p>}
      </div>

      <TextArea
        label="Ulasan (opsional)"
        value={comment}
        maxLength={1000}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ceritakan pengalamanmu dengan produk ini"
      />

      {mutation.isError && (
        <p className="text-sm text-sale">{getErrorMessage(mutation.error)}</p>
      )}

      <div className="flex gap-3">
        <Button className="px-6 py-3" disabled={mutation.isPending} onClick={handleSubmit}>
          {mutation.isPending ? "Mengirim..." : existing ? "Simpan" : "Kirim Ulasan"}
        </Button>
        {onCancel && (
          <Button variant="outline" className="px-6 py-3" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </div>
  );
}