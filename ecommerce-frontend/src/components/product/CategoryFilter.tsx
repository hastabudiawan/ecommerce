"use client";

import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getCategories } from "@/services/category.service";

interface CategoryFilterProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function CategoryFilter({ selectedId, onSelect }: CategoryFilterProps) {
  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <div>
      <h3 className="font-medium">Kategori</h3>
      <ul className="mt-4 space-y-3">
        <li>
          <button
            onClick={() => onSelect(null)}
            className={cn(
              "text-sm text-black/60 hover:text-black",
              selectedId === null && "font-medium text-black",
            )}
          >
            Semua Produk
          </button>
        </li>
        {data?.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onSelect(category.id)}
              className={cn(
                "text-sm text-black/60 hover:text-black",
                selectedId === category.id && "font-medium text-black",
              )}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
