"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Store } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api";

const SELLER_ONLY: UserRole[] = ["SELLER"];

// Part 10 akan menambahkan menu Pesanan dan Settlement di sini
const navItems = [
  { href: "/seller", label: "Toko", icon: Store, exact: true },
  { href: "/seller/products", label: "Produk", icon: Package, exact: false },
];

export function SellerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAuth roles={SELLER_ONLY}>
      <header className="border-b border-black/10">
        <Container className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display text-2xl">
              SHOP.CO
            </Link>
            <span className="rounded-full bg-surface px-3 py-1 text-xs">
              Dashboard Seller
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