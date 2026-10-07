"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getPageNumbers } from "@/lib/utils";

interface PaginationProps {
  page: number; // 1-based
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const numbers = getPageNumbers(page, totalPages);

  return (
    <nav className="mt-10 flex items-center justify-between gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
      >
        <ChevronLeft size={16} /> Previous
      </button>

      <div className="hidden items-center gap-1 sm:flex">
        {numbers.map((n, i) =>
          n === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-black/40">
              ...
            </span>
          ) : (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={cn(
                "h-9 w-9 rounded-full text-sm",
                n === page ? "bg-ink text-white" : "hover:bg-surface",
              )}
            >
              {n}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
      >
        Next <ChevronRight size={16} />
      </button>
    </nav>
  );
}