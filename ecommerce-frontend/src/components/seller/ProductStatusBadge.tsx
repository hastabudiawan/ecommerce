import { cn } from "@/lib/utils";
import type { Product } from "@/types/api";

const STATUS: Record<Product["status"], { label: string; className: string }> = {
  PENDING: { label: "Menunggu review", className: "bg-star/20 text-black" },
  APPROVED: { label: "Disetujui", className: "bg-success/15 text-success" },
  REJECTED: { label: "Ditolak", className: "bg-sale-bg text-sale" },
};

export function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const { label, className } = STATUS[status];

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", className)}>
      {label}
    </span>
  );
}