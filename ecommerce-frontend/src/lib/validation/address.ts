import { z } from "zod";

export const addressSchema = z.object({
  recipientName: z.string().min(1, "Nama penerima wajib diisi"),
  phone: z.string().min(1, "No. HP wajib diisi").max(20, "Maksimal 20 karakter"),
  addressLine: z.string().min(1, "Alamat wajib diisi"),
  city: z.string().min(1, "Kota wajib diisi").max(100, "Maksimal 100 karakter"),
  province: z.string().min(1, "Provinsi wajib diisi").max(100, "Maksimal 100 karakter"),
  postalCode: z.string().min(1, "Kode pos wajib diisi").max(10, "Maksimal 10 karakter"),
  isDefault: z.boolean(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;