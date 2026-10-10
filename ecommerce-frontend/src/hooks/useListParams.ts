"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Membaca dan menulis filter status + halaman dari URL.
// Nilai status yang tidak dikenal (misalnya hasil mengetik URL sembarangan)
// otomatis diganti ke nilai default.
export function useListParams(defaultStatus: string, allowedStatuses: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawStatus = searchParams.get("status");
  const status =
    rawStatus && allowedStatuses.includes(rawStatus) ? rawStatus : defaultStatus;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  function setStatus(next: string) {
    // Pindah tab selalu kembali ke halaman 1
    router.push(`${pathname}?status=${next}`);
  }

  function setPage(next: number) {
    router.push(`${pathname}?status=${status}&page=${next}`);
  }

  return { status, page, setStatus, setPage };
}