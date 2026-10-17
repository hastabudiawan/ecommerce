import { cn, formatRupiah } from "@/lib/utils";
import type { Product } from "@/types/api";

interface PriceTagProps {
  product: Pick<Product, "price" | "finalPrice" | "discountPercent">;
  size?: "md" | "lg";
  className?: string;
}

// Harga akhir tebal, harga normal dicoret, dan badge persen, sesuai desain SHOP.CO
export function PriceTag({ product, size = "md", className }: PriceTagProps) {
  const discounted = product.discountPercent > 0;
  const textSize = size === "lg" ? "text-2xl" : "text-base";

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      <span className={cn("font-semibold", textSize)}>
        {formatRupiah(product.finalPrice)}
      </span>

      {discounted && (
        <>
          <span className={cn("text-black/40 line-through", textSize)}>
            {formatRupiah(product.price)}
          </span>
          <span className="rounded-full bg-sale-bg px-2.5 py-1 text-xs font-medium text-sale">
            -{product.discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}