import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { Product } from "@/types/api";

export function ProductCard({ product }: { product: Product }) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-card">
        {primaryImage ? (
          <Image
            src={primaryImage.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-black/20">
            <ImageOff size={32} />
          </div>
        )}
      </div>
      <h3 className="mt-4 line-clamp-1 text-base font-medium">{product.name}</h3>
      <p className="mt-1 font-semibold">{formatRupiah(product.price)}</p>
    </Link>
  );
}