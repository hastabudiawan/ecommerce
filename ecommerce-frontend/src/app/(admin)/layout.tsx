import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageFallback } from "@/components/ui/PageFallback";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminShell>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </AdminShell>
  );
}