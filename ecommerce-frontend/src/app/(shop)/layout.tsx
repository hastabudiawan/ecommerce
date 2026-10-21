import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageFallback } from "@/components/ui/PageFallback";
import { VerifyEmailBanner } from "@/components/auth/VerifyEmailBanner";

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <VerifyEmailBanner />
      <Navbar />
      <main>
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
      </main>
      <Footer />
    </>
  );
}