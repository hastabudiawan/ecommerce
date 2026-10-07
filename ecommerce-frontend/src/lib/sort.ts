export const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Terbaru",
    sortBy: "createdAt",
    direction: "desc" as const,
  },
  {
    value: "price-asc",
    label: "Harga: Rendah ke Tinggi",
    sortBy: "price",
    direction: "asc" as const,
  },
  {
    value: "price-desc",
    label: "Harga: Tinggi ke Rendah",
    sortBy: "price",
    direction: "desc" as const,
  },
  {
    value: "name-asc",
    label: "Nama: A-Z",
    sortBy: "name",
    direction: "asc" as const,
  },
];

export function resolveSort(value: string) {
  return SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
}
