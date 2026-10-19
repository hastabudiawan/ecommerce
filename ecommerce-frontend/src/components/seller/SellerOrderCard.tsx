import { Store } from "lucide-react";
import { StatusBadge } from "@/components/order/StatusBadge";
import { Button } from "@/components/ui/Button";
import type { OrderAction } from "@/lib/order-status";
import { formatDate, formatRupiah, withVariant } from "@/lib/utils"; // withVariant ditambahkan
import type { Order, OrderStatus } from "@/types/api";

interface SellerOrderCardProps {
  order: Order;
  actions?: OrderAction[];
  note?: string;
  disabled: boolean;
  updatingStatus: OrderStatus | null; // status tujuan yang sedang diproses untuk pesanan ini
  onAction: (action: OrderAction) => void;
  storeLabel?: string; // diisi di dashboard admin
}

export function SellerOrderCard({
  order,
  actions,
  note,
  disabled,
  updatingStatus,
  onAction,
  storeLabel,
}: SellerOrderCardProps) {
  return (
    <div className="rounded-2xl border border-black/10 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {storeLabel && (
            <p className="mb-1 flex items-center gap-1 text-sm text-black/50">
              <Store size={14} />
              {storeLabel}
            </p>
          )}
          <p className="font-medium">{order.orderNumber}</p>
          <p className="text-sm text-black/50">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <ul className="mt-4 divide-y divide-black/10">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 py-2 text-sm">
            <span>
              {/* withVariant digunakan di sini */}
              {withVariant(item.productName, item.variantLabel)}{" "}
              <span className="text-black/50">× {item.quantity}</span>
            </span>
            <span className="font-medium">{formatRupiah(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-xl bg-surface p-3 text-sm">
        <p className="font-medium">{order.recipientName}</p>
        <p className="text-black/60">{order.shippingAddress}</p>
      </div>

      <div className="mt-4 border-t border-black/10 pt-4">
        <p className="text-sm">
          <span className="text-black/60">
            Total (ongkir {formatRupiah(order.shippingCost)}){" "}
          </span>
          <span className="font-semibold">{formatRupiah(order.total)}</span>
        </p>

        {note && <p className="mt-3 text-sm text-black/50">{note}</p>}

        {actions && actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button
                key={action.next}
                variant={action.destructive ? "outline" : "primary"}
                className={action.destructive ? "px-6 py-3 text-sale" : "px-6 py-3"}
                disabled={disabled}
                onClick={() => onAction(action)}
              >
                {updatingStatus === action.next ? "Memproses..." : action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}