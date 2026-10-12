"use client";

import { useQuery } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AddressManager } from "@/components/account/AddressManager";
import { PasswordForm } from "@/components/account/PasswordForm";
import { ProfileForm } from "@/components/account/ProfileForm";
import { Container } from "@/components/ui/Container";
import { formatDate } from "@/lib/utils";
import { getMe } from "@/services/account.service";
import { useAuthStore } from "@/store/auth.store";

function AccountContent() {
  const user = useAuthStore((s) => s.user);

  const { data: account, isLoading } = useQuery({
    queryKey: ["me", user?.userId],
    queryFn: getMe,
    enabled: !!user,
  });

  if (isLoading || !account) {
    return <p className="mt-8 text-sm text-black/50">Memuat akun...</p>;
  }

  return (
    <div className="mt-6 max-w-2xl space-y-10">
      <section>
        <h2 className="text-xl font-semibold">Profil</h2>
        <p className="mt-1 text-sm text-black/50">
          {account.role} · bergabung {formatDate(account.createdAt)}
        </p>
        <div className="mt-4">
          <ProfileForm key={account.id} account={account} />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Ganti Password</h2>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Alamat Saya</h2>
        <div className="mt-4">
          <AddressManager />
        </div>
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Container className="py-10">
      <p className="text-sm text-black/50">Home {" > "} Akun Saya</p>
      <h1 className="mt-4 font-display text-3xl md:text-4xl">AKUN SAYA</h1>

      <RequireAuth>
        <AccountContent />
      </RequireAuth>
    </Container>
  );
}