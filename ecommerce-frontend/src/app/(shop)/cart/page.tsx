"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Store } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { Container } from "@/components/ui/Container";
import { getErrorMessage } from "@/lib/errors";
import { formatRupiah } from "@/lib/utils";
import { getCart, removeCartItem, updateCartItem } from "@/services/cart.service";
import type { CartDto, CartItemDto } from "@/types/api";

function CartContent() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: cart, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  // Backend mengembalikan keranjang terbaru di setiap respons, jadi langsung
  // ditaruh ke cache. Badge di Navbar (query key yang sama) ikut berubah seketika.
  function handleSuccess(updated: CartDto) {
    setError(null);
    queryClient.setQueryData(["cart"], updated);
  }

  function handleError(err: unknown) {
    setError(getErrorMessage(err));
  }

  const update = useMutation({
    mutationFn: updateCartItem,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const remove = useMutation({
    mutationFn: removeCartItem,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const busy = update.isPending || remove.isPending;

  if (isLoading) {
    return <p className="mt-8 text-sm text-black/50">Memuat keranjang...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-black/10 p-10 text-center">
        <p className="text-black/60">Keranjang kamu masih kosong.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  // Kelompokkan item per toko. storeId null = produk platform.
  const groups = new Map<number | null, { storeName: string; items: CartItemDto[] }>();
  for (const item of cart.items) {
    if (!groups.has(item.storeId)) {
      groups.set(item.storeId, { storeName: item.storeName ?? "Platform", items: [] });
    }
    groups.get(item.storeId)!.items.push(item);
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="space-y-6 rounded-2xl border border-black/10 p-4 md:p-6">
        {Array.from(groups.entries()).map(([storeId, group]) => (
          <div key={storeId ?? "platform"}>
            <p className="flex items-center gap-2 text-sm text-black/50">
              <Store size={16} />
              {group.storeName}
            </p>
            <div className="mt-2 divide-y divide-black/10">
              {group.items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  disabled={busy}
                  onChangeQuantity={(quantity) =>
                    update.mutate({ itemId: item.id, quantity })
                  }
                  onRemove={() => remove.mutate(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <aside className="rounded-2xl border border-black/10 p-5 md:p-6">
        <h2 className="text-xl font-semibold">Order Summary</h2>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-black/60">Subtotal ({cart.totalItems} item)</span>
          <span className="font-semibold">{formatRupiah(cart.totalPrice)}</span>
        </div>
        <p className="mt-2 text-sm text-black/50">
          Ongkos kirim dihitung saat checkout.
        </p>

        {error && <p className="mt-4 text-sm text-sale">{error}</p>}

        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Go to Checkout <ArrowRight size={18} />
        </Link>
      </aside>
    </div>
  );
}

export default function CartPage() {
  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">Home {" > "} Cart</p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">YOUR CART</h1>

      <RequireAuth>
        <CartContent />
      </RequireAuth>
    </Container>
  );
}