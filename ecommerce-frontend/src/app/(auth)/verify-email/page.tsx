"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/errors";
import { verifyEmail } from "@/services/auth.service";

type State = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const token = useSearchParams().get("token");
  const queryClient = useQueryClient();

  // Tautan hanya bisa dipakai sekali. Ref ini mencegah permintaan terkirim dua kali
  // (misalnya oleh mode pengembangan React), yang akan membuat percobaan kedua gagal.
  const startedRef = useRef(false);

  const [state, setState] = useState<State>(token ? "loading" : "error");
  const [message, setMessage] = useState<string | null>(
    token ? null : "Tautan verifikasi tidak lengkap.",
  );

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    verifyEmail(token)
      .then(() => {
        setState("success");
        // Banner "email belum diverifikasi" ikut hilang
        queryClient.invalidateQueries({ queryKey: ["me"] });
      })
      .catch((err) => {
        setState("error");
        setMessage(getErrorMessage(err));
      });
  }, [token, queryClient]);

  if (state === "loading") {
    return <p className="text-sm text-black/60">Memverifikasi email...</p>;
  }

  if (state === "success") {
    return (
      <>
        <h1 className="font-display text-2xl">Email terverifikasi</h1>
        <p className="mt-3 text-sm text-black/60">
          Terima kasih. Kamu sekarang bisa berbelanja dan checkout.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-sm font-medium text-white hover:opacity-90"
        >
          Mulai Belanja
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl">Verifikasi gagal</h1>
      <p className="mt-3 text-sm text-sale">{message}</p>
      <p className="mt-3 text-sm text-black/60">
        Masuk ke akunmu, lalu klik &quot;Kirim ulang email verifikasi&quot; di bagian atas
        halaman untuk mendapat tautan baru.
      </p>
      <Link href="/login" className="mt-6 inline-block text-sm font-medium underline">
        Masuk
      </Link>
    </>
  );
}