"use client";

import { cn } from "@/lib/utils";
import type { Variant } from "@/types/api";

interface VariantPickerProps {
  variants: Variant[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
}

export function VariantPicker({
  variants,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: VariantPickerProps) {
  // Daftar unik, urutannya mengikuti kemunculan pertama
  const colors = new Map<string, string | null>();
  const sizes: string[] = [];
  for (const variant of variants) {
    if (variant.colorName && !colors.has(variant.colorName)) {
      colors.set(variant.colorName, variant.colorHex);
    }
    if (variant.size && !sizes.includes(variant.size)) {
      sizes.push(variant.size);
    }
  }

  // Warna tersedia kalau ada ukuran apa pun yang masih ada stoknya
  function colorAvailable(color: string) {
    return variants.some((v) => v.colorName === color && v.stock > 0);
  }

  // Ukuran tersedia kalau masih ada stoknya (pada warna terpilih, kalau warna sudah dipilih)
  function sizeAvailable(size: string) {
    return variants.some(
      (v) => v.size === size && v.stock > 0 && (!selectedColor || v.colorName === selectedColor),
    );
  }

  return (
    <div className="space-y-5">
      {colors.size > 0 && (
        <div>
          <p className="text-sm text-black/60">
            Warna{selectedColor ? `: ` : ""}
            {selectedColor && <span className="font-medium text-black">{selectedColor}</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {Array.from(colors.entries()).map(([name, hex]) => {
              const available = colorAvailable(name);
              const selected = selectedColor === name;

              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={name}
                  aria-pressed={selected}
                  disabled={!available}
                  onClick={() => onColorChange(name)}
                  style={{ backgroundColor: hex ?? "#d4d4d4" }}
                  className={cn(
                    "h-9 w-9 rounded-full border border-black/15",
                    selected && "ring-2 ring-ink ring-offset-2",
                    !available && "cursor-not-allowed opacity-30",
                  )}
                />
              );
            })}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm text-black/60">
            Ukuran{selectedSize ? `: ` : ""}
            {selectedSize && <span className="font-medium text-black">{selectedSize}</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((size) => {
              const available = sizeAvailable(size);
              const selected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={selected}
                  disabled={!available}
                  onClick={() => onSizeChange(size)}
                  className={cn(
                    "rounded-full px-5 py-3 text-sm",
                    selected ? "bg-ink text-white" : "bg-surface text-black/70 hover:text-black",
                    !available && "cursor-not-allowed line-through opacity-40",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}