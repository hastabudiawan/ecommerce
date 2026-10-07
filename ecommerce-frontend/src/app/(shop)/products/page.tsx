"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CategoryFilter } from "@/components/product/CategoryFilter";
import { FilterDrawer } from "@/components/product/FilterDrawer";
import { Pagination } from "@/components/product/Pagination";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/product/SortSelect";
import { resolveSort } from "@/lib/sort";
import { getCategories } from "@/services/category.service";
import { getProducts } from "@/services/product.service";

const PAGE_SIZE = 9;

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const categoryId = searchParams.get("categoryId")
    ? Number(searchParams.get("categoryId"))
    : null;
  const keyword = searchParams.get("keyword") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const sortValue = searchParams.get("sort") ?? "newest";
  const sort = resolveSort(sortValue);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", { categoryId, keyword, page, sortValue }],
    queryFn: () =>
      getProducts({
        categoryId: categoryId ?? undefined,
        keyword: keyword || undefined,
        page: page - 1,
        size: PAGE_SIZE,
        sortBy: sort.sortBy,
        direction: sort.direction,
      }),
  });

  function updateParams(next: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    router.push(`/products?${params.toString()}`);
  }

  const activeCategoryName = categoryId
    ? categories?.find((c) => c.id === categoryId)?.name
    : null;

  const total = data?.totalElements ?? 0;
  const from = total === 0 ? 0 : page * PAGE_SIZE - PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">
        Home {" > "} {activeCategoryName ?? "Semua Produk"}
      </p>

      <div className="mt-6 flex flex-col gap-10 md:flex-row">
        <aside className="hidden w-65 shrink-0 md:block">
          <CategoryFilter
            selectedId={categoryId}
            onSelect={(id) => updateParams({ categoryId: id, page: 1 })}
          />
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl">
                {activeCategoryName ?? "Semua Produk"}
              </h1>
              <p className="mt-1 text-sm text-black/50">
                {total > 0
                  ? `Menampilkan ${from}-${to} dari ${total} Produk`
                  : "Tidak ada produk ditemukan"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm md:hidden"
              >
                <SlidersHorizontal size={16} /> Filter
              </button>
              <SortSelect
                value={sortValue}
                onChange={(value) => updateParams({ sort: value, page: 1 })}
              />
            </div>
          </div>

          {isLoading ? (
            <p className="mt-10 text-sm text-black/50">Memuat produk...</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {data?.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {data && (
            <Pagination
              page={page}
              totalPages={data.totalPages}
              onChange={(next) => updateParams({ page: next })}
            />
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selectedCategoryId={categoryId}
        onSelectCategory={(id) => updateParams({ categoryId: id, page: 1 })}
      />
    </Container>
  );
}