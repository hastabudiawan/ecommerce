"use client";

import { useQuery } from "@tanstack/react-query";
import { BrandStrip } from "@/components/home/BrandStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { ProductSection } from "@/components/product/ProductSection";
import { getProducts } from "@/services/product.service";

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => getProducts({ size: 4, sortBy: "createdAt", direction: "desc" }),
  });

  return (
    <>
      <Hero />
      <BrandStrip />
      <ProductSection
        title="NEW ARRIVALS"
        products={data?.content ?? []}
        viewAllHref="/products"
      />
      <CategoryGrid />
    </>
  );
}