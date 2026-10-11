"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl">Terjadi kesalahan</h1>
      <p className="mt-3 text-black/60">
        Halaman gagal dimuat. Coba lagi sebentar lagi.
      </p>
      <Button onClick={reset} className="mt-6">
        Coba lagi
      </Button>
    </div>
  );
}
