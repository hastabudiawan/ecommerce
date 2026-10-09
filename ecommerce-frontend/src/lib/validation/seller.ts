import { z } from "zod";

export const storeSchema = z.object({
  storeName: z.string().min(1, "Nama toko wajib diisi").max(150, "Maksimal 150 karakter"),
  city: z.string().max(100, "Maksimal 100 karakter").optional(),
  description: z.string().optional(),
});

export type StoreFormValues = z.infer<typeof storeSchema>;

// Harga dan stok disimpan sebagai string di form, lalu diubah ke angka saat submit.
// Input kosong pada field angka menghasilkan NaN dan pesan error bawaan yang membingungkan,
// jadi lebih mudah memvalidasi teksnya langsung.
export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(200, "Maksimal 200 karakter"),
  categoryId: z.string().min(1, "Pilih kategori"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Harga wajib diisi")
    .regex(/^\d+$/, "Harga harus berupa angka bulat"),
  stock: z
    .string()
    .min(1, "Stok wajib diisi")
    .regex(/^\d+$/, "Stok harus berupa angka bulat"),
});

export type ProductFormValues = z.infer<typeof productSchema>;