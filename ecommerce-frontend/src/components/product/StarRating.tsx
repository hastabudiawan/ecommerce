import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number; // 0 sampai 5, boleh desimal
  size?: number;
  className?: string;
}

// Lima bintang abu-abu sebagai dasar, ditimpa lima bintang kuning yang dipotong
// sesuai lebar nilai rating. Dengan cara ini 4,3 bintang benar-benar terisi 86%.
export function StarRating({ value, size = 16, className }: StarRatingProps) {
  const percent = Math.max(0, Math.min(5, value)) * 20;

  return (
    <div
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={`Rating ${value.toFixed(1)} dari 5`}
    >
      <div className="flex text-black/15">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 flex overflow-hidden text-star"
        style={{ width: `${percent}%` }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} size={size} fill="currentColor" strokeWidth={0} className="shrink-0" />
        ))}
      </div>
    </div>
  );
}