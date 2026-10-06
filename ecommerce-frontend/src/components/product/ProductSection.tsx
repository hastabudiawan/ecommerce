import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/api";

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

export function ProductSection({ title, products, viewAllHref }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <Container>
        <h2 className="text-center font-display text-3xl md:text-4xl">{title}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {viewAllHref && (
          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              href={viewAllHref}
              className="rounded-full border border-black/20 px-10 py-3.5 text-sm font-medium hover:bg-surface"
            >
              View All
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}