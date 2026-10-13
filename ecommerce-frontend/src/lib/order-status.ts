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

export interface OrderAction {
  next: OrderStatus;
  label: string;
  destructive?: boolean;
}

// Tindakan yang ditawarkan ke seller. Pesanan Dikirim tidak punya tindakan:
// penyelesaiannya oleh pembeli (atau otomatis).
export const SELLER_ACTIONS: Partial<Record<OrderStatus, OrderAction[]>> = {
  PENDING: [
    { next: "PAID", label: "Konfirmasi Pembayaran" },
    { next: "CANCELLED", label: "Batalkan", destructive: true },
  ],
  PAID: [
    { next: "SHIPPED", label: "Kirim Pesanan" },
    { next: "CANCELLED", label: "Batalkan", destructive: true },
  ],
};

// Admin memproses pesanan produk platform seperti seller, plus bisa menyelesaikan
// pesanan yang sudah dikirim (misalnya saat pembeli tidak responsif).
export const ADMIN_ACTIONS: Partial<Record<OrderStatus, OrderAction[]>> = {
  ...SELLER_ACTIONS,
  SHIPPED: [{ next: "COMPLETED", label: "Tandai Selesai" }],
};