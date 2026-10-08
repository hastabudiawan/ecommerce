import Link from "next/link";
import { CheckCircle2, Store } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { OrderGroup } from "@/types/api";

export function CheckoutSuccess({ group }: { group: OrderGroup }) {
  return (
    <div className="mx-auto mt-10 max-w-160 rounded-2xl border border-black/10 p-6 md:p-10">
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 size={48} className="text-success" />
        <h2 className="mt-4 font-display text-2xl">Pesanan berhasil dibuat</h2>
        <p className="mt-2 text-sm text-black/60">
          Nomor transaksi {group.groupNumber}
        </p>
      </div>

      <ul className="mt-8 space-y-3">
        {group.orders.map((order) => (
          <li key={order.id} className="rounded-xl bg-surface p-4 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium">
                <Store size={16} />
                {order.storeName ?? "Platform"}
              </span>
              <span className="text-black/50">{order.status}</span>
            </div>
            <p className="mt-1 text-black/50">{order.orderNumber}</p>
            <div className="mt-2 flex justify-between">
              <span>Total (termasuk ongkir)</span>
              <span className="font-semibold">{formatRupiah(order.total)}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between border-t border-black/10 pt-4 font-semibold">
        <span>Total</span>
        <span>{formatRupiah(group.total)}</span>
      </div>

      <p className="mt-6 text-sm text-black/60">
        Dikirim ke {group.recipientName}, {group.shippingAddress}
      </p>
      <p className="mt-2 text-sm text-black/50">
        Pembayaran online belum tersedia di versi ini. Pesanan berstatus PENDING
        dan diproses oleh masing-masing penjual.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/orders"
          className="flex-1 rounded-full bg-ink px-8 py-4 text-center text-sm font-medium text-white hover:opacity-90"
        >
          Lihat Pesanan Saya
        </Link>
        <Link
          href="/products"
          className="flex-1 rounded-full border border-black/20 px-8 py-4 text-center text-sm font-medium hover:bg-surface"
        >
          Lanjut Belanja
        </Link>
      </div>
    </div>
  );
}