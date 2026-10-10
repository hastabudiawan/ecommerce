// Tarif flat per toko, dalam Rupiah. Backend belum punya perhitungan ongkir,

import { OrderStatus } from "@/types/api";

// jadi nilainya ditentukan di sini dan dikirim saat checkout.
export const SHIPPING_FLAT_RATE = 15000;

// Langkah berikutnya yang ditawarkan ke seller untuk tiap status.
// Status yang tidak ada di sini (COMPLETED, CANCELLED) sudah final dan tidak punya aksi.
export const SELLER_NEXT_ACTION: Partial<
  Record<OrderStatus, { next: OrderStatus; label: string }>
> = {
  PENDING: { next: "PAID", label: "Konfirmasi Pembayaran" },
  PAID: { next: "SHIPPED", label: "Kirim Pesanan" },
  SHIPPED: { next: "COMPLETED", label: "Tandai Selesai" },
};