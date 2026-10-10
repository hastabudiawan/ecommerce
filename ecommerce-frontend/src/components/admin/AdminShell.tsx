"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, PackageCheck, Wallet } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api";

const ADMIN_ONLY: UserRole[] = ["ADMIN"];

const navItems = [
  { href: "/admin", label: "Review Produk", icon: PackageCheck, exact: true },
  { href: "/admin/orders", label: "Pesanan", icon: ClipboardList, exact: false },
  { href: "/admin/settlements", label: "Settlement", icon: Wallet, exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth roles={ADMIN_ONLY}>
      <header className="border-b border-black/10">
        <Container className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-2xl">
              SHOP.CO
            </Link>
            <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">
              Dashboard Admin
            </span>
          </div>
          <Link href="/" className="text-sm text-black/60 hover:text-black">
            Kembali ke toko
          </Link>
        </Container>
      </header>

      <Container className="grid gap-6 py-8 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm",
                  active ? "bg-ink text-white" : "text-black/60 hover:bg-surface",
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0">{children}</main>
      </Container>
    </RequireAuth>
  );
}