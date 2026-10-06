"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui/Container";
import { getCategories } from "@/services/category.service";

export function CategoryGrid() {
  const { data } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  if (!data || data.length === 0) return null;

  return (
    <section className="bg-surface py-12 md:py-16">
      <Container>
        <h2 className="text-center font-display text-3xl md:text-4xl">
          Browse by Category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-4">
          {data.map((category) => (
            <Link
              key={category.id}
              href={`/products?categoryId=${category.id}`}
              className="flex h-28 items-center justify-center rounded-2xl bg-white text-lg font-medium transition hover:bg-ink hover:text-white md:h-36"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}