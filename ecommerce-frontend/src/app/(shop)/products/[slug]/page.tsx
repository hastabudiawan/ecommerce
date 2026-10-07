"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSection } from "@/components/product/ProductSection";
import { formatRupiah } from "@/lib/utils";
import { addCartItem } from "@/services/cart.service";
import { getProductBySlug, getProducts } from "@/services/product.service";
import { useAuthStore } from "@/store/auth.store";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
  });

  const { data: related } = useQuery({
    queryKey: ["products", "related", product?.categoryId],
    queryFn: () => getProducts({ categoryId: product!.categoryId, size: 5 }),
    enabled: !!product,
  });

  const addToCart = useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setFeedback("Berhasil ditambahkan ke keranjang.");
    },
    onError: () => {
      setFeedback("Gagal menambahkan ke keranjang. Coba lagi.");
    },
  });

  if (isLoading) {
    return <Container className="py-10">Memuat produk...</Container>;
  }

  if (!product) {
    return <Container className="py-10">Produk tidak ditemukan.</Container>;
  }

  function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!product) {
      return;
    }

    addToCart.mutate({ productId: product.id, quantity });
  }

  const outOfStock = product.stock <= 0;
  const relatedProducts = (related?.content ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Container className="py-10">
        <p className="text-sm text-black/50">
          Home {" > "} {product.categoryName} {" > "} {product.name}
        </p>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <ProductGallery images={product.images} />

          <div>
            <h1 className="font-display text-2xl md:text-3xl">{product.name}</h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-black/50">
              <Store size={16} />
              Dijual oleh {product.storeName ?? "Platform"}
            </p>

            <p className="mt-4 text-2xl font-semibold">{formatRupiah(product.price)}</p>

            {product.description && (
              <p className="mt-4 text-black/60">{product.description}</p>
            )}

            <p className="mt-4 text-sm text-black/50">
              {outOfStock ? "Stok habis" : `Stok tersedia: ${product.stock}`}
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-full border border-black/10">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3"
                  aria-label="Kurangi"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-3"
                  aria-label="Tambah"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={outOfStock || addToCart.isPending}
                className="flex-1"
              >
                {outOfStock
                  ? "Stok Habis"
                  : addToCart.isPending
                    ? "Menambahkan..."
                    : "Add to Cart"}
              </Button>
            </div>

            {feedback && <p className="mt-3 text-sm text-black/60">{feedback}</p>}
          </div>
        </div>
      </Container>

      <ProductSection title="You Might Also Like" products={relatedProducts} />
    </>
  );
}