"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CategoryFilter } from "@/components/product/CategoryFilter";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
}

export function FilterDrawer({
  open,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}: FilterDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Filters</h2>
          <button onClick={onClose} aria-label="Tutup">
            <X size={22} />
          </button>
        </div>

        <div className="mt-6">
          <CategoryFilter selectedId={selectedCategoryId} onSelect={onSelectCategory} />
        </div>

        <Button onClick={onClose} className="mt-8 w-full">
          Terapkan Filter
        </Button>
      </div>
    </div>
  );
}