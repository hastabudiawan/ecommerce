import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-5xl">404</h1>
      <p className="mt-3 text-black/60">Halaman yang kamu cari tidak ditemukan.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-ink px-10 py-4 text-sm font-medium text-white hover:opacity-90"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}