"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronDown, CircleUser, Menu, Search, ShoppingCart, X } from "lucide-react";
import { Container } from "@/components/ui/Container";

import { useMutation } from "@tanstack/react-query";
import { logout as logoutApi } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const links = [
  { label: "Shop", href: "/products", chevron: true },
  { label: "New Arrivals", href: "/products?sortBy=createdAt&direction=desc" },
];

export function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    router.push(`/products?keyword=${encodeURIComponent(query.trim())}`);
  }

  const { user, hasHydrated, clearAuth } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      clearAuth();
      router.push("/");
    },
  });

  return (
    <header className="border-b border-black/10">
      <Container className="flex items-center gap-4 py-5 md:gap-10 md:py-6">
        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link
          href="/"
          className="font-display text-[25px] leading-none md:text-[32px]"
        >
          SHOP.CO
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-1 whitespace-nowrap"
            >
              {link.label}
              {link.chevron && <ChevronDown size={16} />}
            </Link>
          ))}
        </nav>

        <form
          onSubmit={handleSearch}
          className="hidden flex-1 items-center gap-3 rounded-full bg-surface px-4 py-3 md:flex"
        >
          <Search size={20} className="text-black/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full bg-transparent outline-none placeholder:text-black/40"
          />
        </form>

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <Link href="/products" aria-label="Search" className="md:hidden">
            <Search size={24} />
          </Link>
          <Link href="/cart" aria-label="Cart">
            <ShoppingCart size={24} />
          </Link>
          {hasHydrated && user ? (
            <div className="group relative">
              <button className="flex items-center gap-2">
                <CircleUser size={24} />
                <span className="hidden text-sm md:inline">{user.name}</span>
              </button>
              <div className="invisible absolute right-0 top-full z-10 w-40 rounded-xl border border-black/10 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                {user.role === "SELLER" && (
                  <Link href="/seller" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                    Dashboard Toko
                  </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface">
                    Dashboard Admin
                  </Link>
                )}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface"
                >
                  Keluar
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" aria-label="Account">
              <CircleUser size={24} />
            </Link>
          )}
        </div>
      </Container>

      {menuOpen && (
        <nav className="border-t border-black/10 md:hidden">
          <Container className="flex flex-col gap-4 py-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </nav>
      )}
    </header>
  );
}