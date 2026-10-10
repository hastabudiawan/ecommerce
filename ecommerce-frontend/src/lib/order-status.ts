import type { OrderStatus } from "@/types/api";

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Menunggu", className: "bg-star/20 text-black" },
  PAID: { label: "Dibayar", className: "bg-surface text-black" },
  SHIPPED: { label: "Dikirim", className: "bg-ink text-white" },
  COMPLETED: { label: "Selesai", className: "bg-success/15 text-success" },
  CANCELLED: { label: "Dibatalkan", className: "bg-sale-bg text-sale" },
};

// Urutan tahap normal sebuah pesanan. CANCELLED sengaja tidak termasuk,
// karena itu keluar dari alur normal dan ditampilkan sebagai badge saja.
export const PROGRESS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Pesanan dibuat" },
  { status: "PAID", label: "Dibayar" },
  { status: "SHIPPED", label: "Dikirim" },
  { status: "COMPLETED", label: "Selesai" },
];

// Langkah berikutnya yang ditawarkan ke seller untuk tiap status.
// Status yang tidak ada di sini (COMPLETED, CANCELLED) sudah final dan tidak punya aksi.
export const SELLER_NEXT_ACTION: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string }>
> = {
  PENDING: { next: "PAID", label: "Konfirmasi Pembayaran" },
  PAID: { next: "SHIPPED", label: "Kirim Pesanan" },
  SHIPPED: { next: "COMPLETED", label: "Tandai Selesai" },
};