"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Container } from "@/components/ui/Container";
import { getErrorMessage } from "@/lib/errors";
import { getMe } from "@/services/account.service";
import { resendVerification } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function VerifyEmailBanner() {
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState<string | null>(null);

  // Kunci sama dengan AuthSync (Part 14), jadi data akunnya tidak diminta dua kali
  const { data: account } = useQuery({
    queryKey: ["me", user?.userId],
    queryFn: getMe,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const resend = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => setMessage("Email verifikasi dikirim. Cek kotak masukmu."),
    onError: (err) => setMessage(getErrorMessage(err)),
  });

  //if (!user || !account || account.emailVerified) return null;
  const unverified = account?.emailVerified === false;
  
  return (
    <div className="bg-ink text-white">
      <Container className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-sm">
        <span>Email kamu belum diverifikasi, jadi belum bisa checkout.</span>
        <button
          onClick={() => {
            setMessage(null);
            resend.mutate();
          }}
          disabled={resend.isPending}
          className="underline disabled:opacity-60"
        >
          {resend.isPending ? "Mengirim..." : "Kirim ulang email verifikasi"}
        </button>
        {message && <span className="text-white/70">{message}</span>}
      </Container>
    </div>
  );
}