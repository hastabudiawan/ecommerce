"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/errors";
import { deleteAddress, getAddresses, setDefaultAddress } from "@/services/address.service";
import type { Address } from "@/types/api";

export function AddressManager() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
  });

  function refresh() {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["addresses"] });
  }

  const makeDefault = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: refresh,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: deleteAddress,
    onSuccess: refresh,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const busy = makeDefault.isPending || remove.isPending;

  function handleSaved() {
    setEditing(null);
    refresh();
  }

  function handleDelete(address: Address) {
    if (!window.confirm(`Hapus alamat atas nama ${address.recipientName}?`)) return;
    remove.mutate(address.id);
  }

  if (isLoading) {
    return <p className="text-sm text-black/50">Memuat alamat...</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-sale">{error}</p>}

      {addresses && addresses.length === 0 && editing === null && (
        <p className="text-sm text-black/60">Belum ada alamat tersimpan.</p>
      )}

      <div className="space-y-3">
        {addresses?.map((address) => (
          <div key={address.id} className="rounded-2xl border border-black/10 p-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{address.recipientName}</span>
              {address.isDefault && (
                <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">
                  Utama
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-black/60">{address.phone}</p>
            <p className="mt-1 text-sm text-black/60">
              {address.addressLine}, {address.city}, {address.province} {address.postalCode}
            </p>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {!address.isDefault && (
                <button
                  className="underline disabled:opacity-50"
                  disabled={busy}
                  onClick={() => makeDefault.mutate(address.id)}
                >
                  Jadikan utama
                </button>
              )}
              <button
                className="underline disabled:opacity-50"
                disabled={busy}
                onClick={() => setEditing(address)}
              >
                Edit
              </button>
              <button
                className="text-sale underline disabled:opacity-50"
                disabled={busy}
                onClick={() => handleDelete(address)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null ? (
        <AddressForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? undefined : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button className="mt-4 px-6 py-3" onClick={() => setEditing("new")}>
          Tambah Alamat
        </Button>
      )}
    </div>
  );
}