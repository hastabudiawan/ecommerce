"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/api";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const sorted = [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  const [active, setActive] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-card text-black/20">
        <ImageOff size={48} />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {sorted.length > 1 && (
        <div className="flex flex-col gap-3">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-20 overflow-hidden rounded-xl bg-card",
                active === i && "ring-2 ring-ink",
              )}
            >
              <Image src={img.imageUrl} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-card">
        <Image
          src={sorted[active].imageUrl}
          alt=""
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}