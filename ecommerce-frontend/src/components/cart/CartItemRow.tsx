import Image from "next/image";
import Link from "next/link";
import { ImageOff, Minus, Plus, Trash2 } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { CartItemDto } from "@/types/api";

interface CartItemRowProps {
  item: CartItemDto;
  disabled?: boolean;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  disabled,
  onChangeQuantity,
  onRemove,
}: CartItemRowProps) {
  const href = `/products/${item.productSlug}`;

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={href}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-card md:h-28 md:w-28"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-black/20">
            <ImageOff size={24} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="font-medium">
            {item.productName}
          </Link>
          <button
            onClick={onRemove}
            disabled={disabled}
            aria-label="Hapus item"
            className="text-sale disabled:opacity-50"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-lg font-semibold md:text-xl">
            {formatRupiah(item.priceSnapshot)}
          </p>

          <div className="flex items-center rounded-full bg-surface">
            <button
              onClick={() => onChangeQuantity(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              aria-label="Kurangi"
              className="p-3 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onChangeQuantity(item.quantity + 1)}
              disabled={disabled}
              aria-label="Tambah"
              className="p-3 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}