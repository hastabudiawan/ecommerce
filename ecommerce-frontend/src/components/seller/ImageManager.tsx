"use client";

import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { deleteProductImage, uploadProductImage } from "@/services/product.service";
import type { Product } from "@/types/api";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB, sama dengan batas di backend

export function ImageManager({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    setError(null);
    // ID gambar yang benar baru ada setelah produk diambil ulang (lihat catatan di bagian 4)
    queryClient.invalidateQueries({ queryKey: ["seller-product", product.id] });
    queryClient.invalidateQueries({ queryKey: ["seller-products"] });
  }

  const upload = useMutation({
    mutationFn: uploadProductImage,
    onSuccess: refresh,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: deleteProductImage,
    onSuccess: refresh,
    onError: (err) => setError(getErrorMessage(err)),
  });

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Dikosongkan supaya memilih file yang sama dua kali tetap memicu event change
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, dll)");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    setError(null);
    upload.mutate({
      productId: product.id,
      file,
      // Gambar pertama otomatis jadi gambar utama
      isPrimary: product.images.length === 0,
    });
  }

  function handleRemove(imageId: number) {
    if (!window.confirm("Hapus gambar ini?")) return;
    remove.mutate({ productId: product.id, imageId });
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
        {product.images.map((image) => (
          <div
            key={image.id}
            className="relative aspect-square overflow-hidden rounded-xl bg-card"
          >
            <Image
              src={image.imageUrl}
              alt={product.name}
              fill
              sizes="160px"
              className="object-cover"
            />
            {image.isPrimary && (
              <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-xs text-white">
                Utama
              </span>
            )}
            <button
              onClick={() => handleRemove(image.id)}
              disabled={remove.isPending}
              aria-label="Hapus gambar"
              className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-sale shadow disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/20 text-sm text-black/50 hover:bg-surface disabled:opacity-50"
        >
          <ImagePlus size={20} />
          {upload.isPending ? "Mengunggah..." : "Tambah gambar"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="mt-3 text-sm text-sale">{error}</p>}
    </div>
  );
}