import { Suspense } from "react";
import { SellerShell } from "@/components/seller/SellerShell";
import { PageFallback } from "@/components/ui/PageFallback";

export default function SellerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SellerShell>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </SellerShell>
  );
}