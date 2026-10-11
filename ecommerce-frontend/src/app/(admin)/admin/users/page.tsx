"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { Pagination } from "@/components/product/Pagination";
import { Button } from "@/components/ui/Button";
import { useListParams } from "@/hooks/useListParams";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import { changeUserRole, getUsers, setUserEnabled } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import type { AdminUser, UserRole } from "@/types/api";

const PAGE_SIZE = 10;

const TABS = [
  { value: "ALL", label: "Semua" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "SELLER", label: "Seller" },
  { value: "ADMIN", label: "Admin" },
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: "CUSTOMER", label: "Customer" },
  { value: "SELLER", label: "Seller" },
  { value: "ADMIN", label: "Admin" },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const { status, page, setStatus, setPage } = useListParams(
    "ALL",
    TABS.map((tab) => tab.value),
  );

  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", status, page, q],
    queryFn: () =>
      getUsers({
        q,
        role: status === "ALL" ? undefined : (status as UserRole),
        page: page - 1,
        size: PAGE_SIZE,
      }),
    staleTime: 0,
  });

  function handleDone() {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const roleMutation = useMutation({
    mutationFn: changeUserRole,
    onSuccess: handleDone,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const enabledMutation = useMutation({
    mutationFn: setUserEnabled,
    onSuccess: handleDone,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const busy = roleMutation.isPending || enabledMutation.isPending;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setQ(input.trim());
    setPage(1);
  }

  function handleRole(user: AdminUser, role: UserRole) {
    if (role === user.role) return;
    if (!window.confirm(`Ubah role ${user.name} (${user.email}) menjadi ${role}?`)) return;

    setError(null);
    roleMutation.mutate({ id: user.id, role });
  }

  function handleToggle(user: AdminUser) {
    const action = user.enabled ? "Nonaktifkan" : "Aktifkan";
    if (!window.confirm(`${action} akun ${user.name} (${user.email})?`)) return;

    setError(null);
    enabledMutation.mutate({ id: user.id, enabled: !user.enabled });
  }

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl">PENGGUNA</h1>
      <p className="mt-2 text-sm text-black/60">
        Cari akun, ubah role, atau nonaktifkan akun. Akun yang punya toko tidak
        bisa diubah rolenya, dan kamu tidak bisa mengubah akunmu sendiri.
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="flex flex-1 items-center gap-3 rounded-full bg-surface px-4 py-3">
          <Search size={18} className="text-black/40" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full bg-transparent outline-none placeholder:text-black/40"
          />
        </div>
        <Button type="submit" className="px-6 py-3">
          Cari
        </Button>
      </form>

      <div className="mt-4">
        <StatusTabs options={TABS} value={status} onChange={setStatus} />
      </div>

      {error && <p className="mt-4 text-sm text-sale">{error}</p>}
      {isLoading && <p className="mt-6 text-sm text-black/50">Memuat pengguna...</p>}

      {data && data.content.length === 0 && (
        <div className="mt-6 rounded-2xl border border-black/10 p-10 text-center">
          <p className="text-black/60">Tidak ada pengguna yang cocok.</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {data?.content.map((user) => {
          const isSelf = currentUser?.userId === user.id;

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-black/10 p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {user.name}
                    {isSelf && <span className="ml-2 text-xs text-black/40">(kamu)</span>}
                  </p>
                  <p className="text-sm text-black/60">{user.email}</p>
                  {user.phone && <p className="text-sm text-black/50">{user.phone}</p>}
                  <p className="text-xs text-black/40">
                    Bergabung {formatDate(user.createdAt)}
                  </p>
                </div>
                {!user.enabled && (
                  <span className="rounded-full bg-sale-bg px-3 py-1 text-xs font-medium text-sale">
                    Nonaktif
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  Role
                  <select
                    value={user.role}
                    disabled={isSelf || user.hasStore || busy}
                    onChange={(e) => handleRole(user, e.target.value as UserRole)}
                    className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </label>

                <Button
                  variant="outline"
                  className="px-5 py-2"
                  disabled={isSelf || busy}
                  onClick={() => handleToggle(user)}
                >
                  {user.enabled ? "Nonaktifkan" : "Aktifkan"}
                </Button>
              </div>

              {user.hasStore && (
                <p className="mt-2 text-xs text-black/40">
                  Punya toko, jadi role tidak bisa diubah.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
      )}
    </div>
  );
}