import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/ui/PageFallback";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-105 rounded-3xl bg-white p-8 shadow-sm md:p-10">
        <Link href="/" className="font-display text-2xl">
          SHOP.CO
        </Link>
        <div className="mt-8">
          <Suspense fallback={<PageFallback />}>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}