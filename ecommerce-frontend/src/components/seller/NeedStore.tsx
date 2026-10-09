import Link from "next/link";

export function NeedStore() {
  return (
    <div className="rounded-2xl border border-black/10 p-10 text-center">
      <p className="text-black/60">
        Kamu belum punya toko. Buat toko dulu sebelum mengelola produk.
      </p>
      <Link
        href="/seller"
        className="mt-6 inline-block rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
      >
        Buat Toko
      </Link>
    </div>
  );
}