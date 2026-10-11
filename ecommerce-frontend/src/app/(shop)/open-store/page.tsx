"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { StoreForm } from "@/components/seller/StoreForm";
import { Container } from "@/components/ui/Container";
import { openStore } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import type { AuthResponse } from "@/types/api";

function OpenStoreContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();

  function handleSuccess(data: AuthResponse) {
    // Role akun berubah jadi SELLER, dan token baru membawa role itu
    setAuth(data.token, {
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    queryClient.invalidateQueries({ queryKey: ["seller-store"] });
    router.push("/seller");
  }

  if (user?.role !== "CUSTOMER") {
    return (
      <div className="mt-8 rounded-2xl border border-black/10 p-8">
        <p className="text-black/60">
          Akunmu sudah memiliki akses seller atau admin, jadi tidak perlu membuka
          toko dari sini.
        </p>
        <Link href="/seller" className="mt-4 inline-block text-sm underline">
          Ke dashboard seller
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-xl">
      <p className="text-black/60">
        Dengan membuka toko, akunmu menjadi akun seller. Kamu tetap bisa
        berbelanja seperti biasa. Perlu diketahui: setelah punya toko, role
        seller tidak bisa dikembalikan menjadi customer dari aplikasi.
      </p>

      <div className="mt-6">
        <StoreForm
          mutationFn={openStore}
          onSuccess={handleSuccess}
          submitLabel="Buka Toko"
        />
      </div>
    </div>
  );
}

export default function OpenStorePage() {
  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">Home {" > "} Buka Toko</p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">BUKA TOKO</h1>

      <RequireAuth>
        <OpenStoreContent />
      </RequireAuth>
    </Container>
  );
}