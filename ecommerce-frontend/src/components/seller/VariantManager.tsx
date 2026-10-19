"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import { replaceVariants } from "@/services/product.service";
import type { Product, Variant, VariantRequest } from "@/types/api";

interface Row {
  key: string;
  id?: number;
  colorName: string;
  colorHex: string;
  size: string;
  stock: string; // teks di form, diubah ke angka saat disimpan
}

const COLOR_SUGGESTIONS = [
  "Hitam", "Putih", "Abu-abu", "Merah", "Biru", "Hijau", "Kuning", "Coklat", "Navy",
];
const SIZE_SUGGESTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "43", "44",
];

let rowCounter = 0;
function newKey() {
  rowCounter += 1;
  return `row-${rowCounter}`;
}

function emptyRow(): Row {
  return { key: newKey(), colorName: "", colorHex: "#000000", size: "", stock: "0" };
}

function toRow(variant: Variant): Row {
  return {
    key: newKey(),
    id: variant.id,
    colorName: variant.colorName ?? "",
    colorHex: variant.colorHex ?? "#000000",
    size: variant.size ?? "",
    stock: String(variant.stock),
  };
}

const inputClass =
  "w-full rounded-full border border-black/10 bg-surface px-4 py-2 text-sm outline-none focus:border-black/30";

export function VariantManager({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const hasSaved = product.variants.length > 0;

  const [useColor, setUseColor] = useState(product.variants.some((v) => v.colorName));
  const [useSize, setUseSize] = useState(product.variants.some((v) => v.size));
  const [rows, setRows] = useState<Row[]>(() => product.variants.map(toRow));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: replaceVariants,
    onSuccess: (updated) => {
      setError(null);
      setSaved(true);
      queryClient.setQueryData(["seller-product", product.id], updated);
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const totalStock = rows.reduce((sum, row) => sum + (Number(row.stock) || 0), 0);

  function updateRow(key: string, patch: Partial<Row>) {
    setSaved(false);
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setSaved(false);
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(key: string) {
    setSaved(false);
    setRows((current) => current.filter((row) => row.key !== key));
  }

  // Pemeriksaan di browser supaya kesalahan umum langsung terlihat; backend tetap memeriksa ulang
  function validate(): string | null {
    if (!useColor && !useSize) return "Pilih minimal satu atribut: warna atau ukuran";

    const seen = new Set<string>();
    for (const row of rows) {
      if (useColor && !row.colorName.trim()) return "Nama warna wajib diisi di setiap baris";
      if (useSize && !row.size.trim()) return "Ukuran wajib diisi di setiap baris";
      if (!/^\d+$/.test(row.stock)) return "Stok harus berupa angka bulat";

      const key = `${useColor ? row.colorName.trim().toLowerCase() : ""}|${
        useSize ? row.size.trim().toLowerCase() : ""
      }`;
      if (seen.has(key)) return "Ada varian yang kembar (warna dan ukuran yang sama)";
      seen.add(key);
    }
    return null;
  }

  function handleSave() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    const variants: VariantRequest[] = rows.map((row) => ({
      id: row.id,
      colorName: useColor ? row.colorName.trim() : undefined,
      colorHex: useColor ? row.colorHex : undefined,
      size: useSize ? row.size.trim() : undefined,
      stock: Number(row.stock),
    }));

    mutation.mutate({ productId: product.id, variants });
  }

  function handleRemoveAll() {
    if (
      !window.confirm(
        "Hapus semua varian? Item di keranjang pembeli yang memuat varian ini ikut terhapus. Stok produk tetap pada angka terakhir.",
      )
    ) {
      return;
    }
    setError(null);
    mutation.mutate({ productId: product.id, variants: [] });
  }

  const colorListId = `color-options-${product.id}`;
  const sizeListId = `size-options-${product.id}`;

  return (
    <div className="space-y-4">
      <datalist id={colorListId}>
        {COLOR_SUGGESTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={sizeListId}>
        {SIZE_SUGGESTIONS.map((size) => (
          <option key={size} value={size} />
        ))}
      </datalist>

      {rows.length === 0 && (
        <p className="text-sm text-black/60">
          Produk ini belum punya varian. Tambahkan varian kalau produknya punya pilihan
          warna atau ukuran dengan stok yang berbeda-beda. Harga sama untuk semua varian.
        </p>
      )}

      {!hasSaved && (
        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useColor}
              onChange={(e) => setUseColor(e.target.checked)}
            />
            Pakai warna
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useSize}
              onChange={(e) => setUseSize(e.target.checked)}
            />
            Pakai ukuran
          </label>
        </div>
      )}

      {hasSaved && (
        <p className="text-xs text-black/50">
          Atribut yang dipakai: {[useColor && "warna", useSize && "ukuran"].filter(Boolean).join(" dan ")}.
          Untuk mengubahnya, hapus semua varian lalu buat ulang.
        </p>
      )}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-black/10 p-3"
          >
            {useColor && (
              <div className="min-w-[160px] flex-1">
                <span className="text-xs text-black/50">Warna</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={row.colorHex}
                    onChange={(e) => updateRow(row.key, { colorHex: e.target.value })}
                    aria-label="Kode warna"
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-full border border-black/10 bg-transparent p-0"
                  />
                  <input
                    list={colorListId}
                    value={row.colorName}
                    onChange={(e) => updateRow(row.key, { colorName: e.target.value })}
                    placeholder="Hitam"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {useSize && (
              <div className="w-28">
                <span className="text-xs text-black/50">Ukuran</span>
                <input
                  list={sizeListId}
                  value={row.size}
                  onChange={(e) => updateRow(row.key, { size: e.target.value })}
                  placeholder="M"
                  className={`mt-1 ${inputClass}`}
                />
              </div>
            )}

            <div className="w-24">
              <span className="text-xs text-black/50">Stok</span>
              <input
                inputMode="numeric"
                value={row.stock}
                onChange={(e) => updateRow(row.key, { stock: e.target.value })}
                className={`mt-1 ${inputClass}`}
              />
            </div>

            <button
              type="button"
              onClick={() => removeRow(row.key)}
              aria-label="Hapus baris"
              className="mb-1 text-sale"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="px-6 py-3"
          disabled={!useColor && !useSize}
          onClick={addRow}
        >
          + Tambah varian
        </Button>

        {rows.length > 0 && (
          <Button
            type="button"
            className="px-6 py-3"
            disabled={mutation.isPending}
            onClick={handleSave}
          >
            {mutation.isPending ? "Menyimpan..." : "Simpan Varian"}
          </Button>
        )}

        {hasSaved && (
          <button
            type="button"
            className="text-sm text-sale underline disabled:opacity-50"
            disabled={mutation.isPending}
            onClick={handleRemoveAll}
          >
            Hapus semua varian
          </button>
        )}
      </div>

      {rows.length > 0 && (
        <p className="text-sm text-black/60">
          Total stok semua varian: <span className="font-semibold text-black">{totalStock}</span>
        </p>
      )}

      {error && <p className="text-sm text-sale">{error}</p>}
      {saved && <p className="text-sm text-success">Varian tersimpan.</p>}
    </div>
  );
}