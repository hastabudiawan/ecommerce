"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Store } from "lucide-react";
import { PriceTag } from "@/components/product/PriceTag";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSection } from "@/components/product/ProductSection";
import { StarRating } from "@/components/product/StarRating";
import { VariantPicker } from "@/components/product/VariantPicker";
import { ReviewSection } from "@/components/review/ReviewSection";
import { ProductStatusBadge } from "@/components/seller/ProductStatusBadge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getErrorMessage } from "@/lib/errors";
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
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
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
    onError: (err) => {
      setFeedback(getErrorMessage(err, "Gagal menambahkan ke keranjang. Coba lagi."));
    },
  });

  if (isLoading) {
    return <Container className="py-10">Memuat produk...</Container>;
  }

  if (!product) {
    return <Container className="py-10">Produk tidak ditemukan.</Container>;
  }

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const hasColors = variants.some((v) => v.colorName);
  const hasSizes = variants.some((v) => v.size);

  // Varian terpilih: semua atribut yang dipakai produk ini sudah dipilih
  const selectedVariant = hasVariants
    ? (variants.find(
        (v) =>
          (!hasColors || v.colorName === selectedColor) &&
          (!hasSizes || v.size === selectedSize),
      ) ?? null)
    : null;
  const selectionIncomplete = hasVariants && !selectedVariant;

  const availableStock = hasVariants ? (selectedVariant?.stock ?? 0) : product.stock;
  const outOfStock = product.stock <= 0;
  const notPublished = product.status !== "APPROVED";

  function pickColor(color: string) {
    setSelectedColor(color);
    // Kalau ukuran terpilih tidak tersedia pada warna baru, ukuran dikosongkan
    if (
      selectedSize &&
      !variants.some((v) => v.colorName === color && v.size === selectedSize && v.stock > 0)
    ) {
      setSelectedSize(null);
    }
    setQuantity(1);
    setFeedback(null);
  }

  function pickSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
    setFeedback(null);
  }

  function handleAddToCart() {
    if (!user) {
      router.push("/login");
      return;
    }
    addToCart.mutate({
      productId: product!.id,
      variantId: selectedVariant?.id,
      quantity,
    });
  }

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

            {notPublished && (
              <div className="mt-3 flex items-start gap-3 rounded-lg bg-surface px-4 py-3 text-sm text-black/70">
                <ProductStatusBadge status={product.status} />
                <p>
                  Produk ini belum tampil di katalog. Halaman ini hanya bisa dilihat oleh
                  pemilik toko dan admin.
                </p>
              </div>
            )}

            {product.reviewCount > 0 && (
              <a href="#ulasan" className="mt-2 flex items-center gap-2">
                <StarRating value={product.ratingAverage} />
                <span className="text-sm text-black/60">
                  {product.ratingAverage.toFixed(1)}/5 ({product.reviewCount} ulasan)
                </span>
              </a>
            )}

            <p className="mt-3 flex items-center gap-2 text-sm text-black/50">
              <Store size={16} />
              Dijual oleh {product.storeName ?? "Platform"}
            </p>

            <PriceTag product={product} size="lg" className="mt-4" />

            {product.description && (
              <p className="mt-4 text-black/60">{product.description}</p>
            )}

            {hasVariants && (
              <div className="mt-6">
                <VariantPicker
                  variants={variants}
                  selectedColor={selectedColor}
                  selectedSize={selectedSize}
                  onColorChange={pickColor}
                  onSizeChange={pickSize}
                />
              </div>
            )}

            <p className="mt-4 text-sm text-black/50">
              {outOfStock
                ? "Stok habis"
                : selectionIncomplete
                  ? "Pilih varian untuk melihat stok"
                  : `Stok tersedia: ${availableStock}`}
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
                  onClick={() => setQuantity((q) => Math.min(Math.max(availableStock, 1), q + 1))}
                  className="p-3"
                  aria-label="Tambah"
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={
                  outOfStock ||
                  notPublished ||
                  selectionIncomplete ||
                  availableStock <= 0 ||
                  addToCart.isPending
                }
                className="flex-1"
              >
                {notPublished
                  ? "Belum Tersedia"
                  : outOfStock
                    ? "Stok Habis"
                    : selectionIncomplete
                      ? "Pilih Varian"
                      : addToCart.isPending
                        ? "Menambahkan..."
                        : "Add to Cart"}
              </Button>
            </div>

            {feedback && <p className="mt-3 text-sm text-black/60">{feedback}</p>}
          </div>
        </div>

        <ReviewSection product={product} />
      </Container>

      <ProductSection title="You Might Also Like" products={relatedProducts} />
    </>
  );
}