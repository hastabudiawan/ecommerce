"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarInput({ value, onChange }: StarInputProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Pilih rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} bintang`}
          onClick={() => onChange(star)}
        >
          <Star
            size={28}
            strokeWidth={0}
            fill="currentColor"
            className={cn(star <= value ? "text-star" : "text-black/15")}
          />
        </button>
      ))}
    </div>
  );
}