"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Store } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AddressForm } from "@/components/checkout/AddressForm";
import { AddressOption } from "@/components/checkout/AddressOption";
import { CheckoutSuccess } from "@/components/checkout/CheckoutSuccess";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { groupByStore } from "@/lib/cart";
import { getErrorMessage } from "@/lib/errors";
import { SHIPPING_FLAT_RATE } from "@/lib/shipping";
import { formatRupiah } from "@/lib/utils";
import { getAddresses } from "@/services/address.service";
import { getCart } from "@/services/cart.service";
import { checkout } from "@/services/order.service";
import type { Address, OrderGroup } from "@/types/api";

function CheckoutContent() {
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [result, setResult] = useState<OrderGroup | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  const { data: addresses, isLoading: addressLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });

  const placeOrder = useMutation({
    mutationFn: checkout,
    onSuccess: (group) => {
      setResult(group);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  // Layar konfirmasi dicek lebih dulu: setelah checkout, keranjang di cache
  // jadi kosong dan tidak boleh memicu tampilan "keranjang kosong".
  if (result) {
    return <CheckoutSuccess group={result} />;
  }

  if (cartLoading || addressLoading) {
    return <p className="mt-8 text-sm text-black/50">Memuat...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-black/10 p-10 text-center">
        <p className="text-black/60">Tidak ada item untuk di-checkout.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  const groups = groupByStore(cart.items);
  const shippingTotal = groups.length * SHIPPING_FLAT_RATE;
  const total = cart.totalPrice + shippingTotal;

  // Alamat terpilih: pilihan user, kalau belum ada pakai alamat utama, kalau tidak ada pakai yang pertama
  const addressId =
    selectedAddressId ??
    addresses?.find((a) => a.isDefault)?.id ??
    addresses?.[0]?.id ??
    null;

  const noAddress = (addresses?.length ?? 0) === 0;
  const formVisible = showForm || noAddress;

  function handleAddressCreated(address: Address) {
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
    setSelectedAddressId(address.id);
    setShowForm(false);
  }

  function handlePlaceOrder() {
    if (addressId === null) return;
    setError(null);
    placeOrder.mutate({
      addressId,
      shippingCosts: groups.map((group) => ({
        storeId: group.storeId,
        shippingCost: SHIPPING_FLAT_RATE,
      })),
    });
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold">Alamat Pengiriman</h2>

          {!noAddress && (
            <div role="radiogroup" className="mt-4 space-y-3">
              {addresses?.map((address) => (
                <AddressOption
                  key={address.id}
                  address={address}
                  selected={address.id === addressId}
                  onSelect={() => setSelectedAddressId(address.id)}
                />
              ))}
            </div>
          )}

          {formVisible ? (
            <AddressForm
              onCreated={handleAddressCreated}
              onCancel={noAddress ? undefined : () => setShowForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-medium underline"
            >
              + Tambah alamat baru
            </button>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold">Rincian Pesanan</h2>
          <div className="mt-4 space-y-4">
            {groups.map((group) => (
              <div
                key={group.storeId ?? "platform"}
                className="rounded-2xl border border-black/10 p-4 md:p-6"
              >
                <p className="flex items-center gap-2 text-sm text-black/50">
                  <Store size={16} />
                  {group.storeName}
                </p>

                <ul className="mt-3 divide-y divide-black/10">
                  {group.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-4 py-3 text-sm"
                    >
                      <span>
                        {item.productName}{" "}
                        <span className="text-black/50">× {item.quantity}</span>
                      </span>
                      <span className="font-medium">{formatRupiah(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-sm">
                  <span className="text-black/60">Ongkos kirim</span>
                  <span>{formatRupiah(SHIPPING_FLAT_RATE)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="rounded-2xl border border-black/10 p-5 md:p-6">
        <h2 className="text-xl font-semibold">Order Summary</h2>

        <dl className="mt-5 space-y-3">
          <div className="flex justify-between">
            <dt className="text-black/60">Subtotal</dt>
            <dd className="font-semibold">{formatRupiah(cart.totalPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-black/60">
              Ongkos kirim ({groups.length} toko)
            </dt>
            <dd className="font-semibold">{formatRupiah(shippingTotal)}</dd>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-3 text-lg">
            <dt>Total</dt>
            <dd className="font-semibold">{formatRupiah(total)}</dd>
          </div>
        </dl>

        {error && <p className="mt-4 text-sm text-sale">{error}</p>}

        <Button
          onClick={handlePlaceOrder}
          disabled={addressId === null || placeOrder.isPending}
          className="mt-6 w-full"
        >
          {placeOrder.isPending ? "Memproses..." : "Buat Pesanan"}
        </Button>

        {addressId === null && (
          <p className="mt-3 text-sm text-black/50">
            Tambahkan alamat pengiriman dulu untuk melanjutkan.
          </p>
        )}

        <p className="mt-4 text-xs text-black/40">
          Pembayaran online belum tersedia. Pesanan dibuat dengan status PENDING.
        </p>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">
        Home {" > "}
        <Link href="/cart" className="hover:underline">
          Cart
        </Link>{" "}
        {" > "} Checkout
      </p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">CHECKOUT</h1>

      <RequireAuth>
        <CheckoutContent />
      </RequireAuth>
    </Container>
  );
}