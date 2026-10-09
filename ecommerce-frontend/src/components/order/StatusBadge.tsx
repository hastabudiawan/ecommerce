import { ORDER_STATUS } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = ORDER_STATUS[status];

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", className)}>
      {label}
    </span>
  );
}