"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/account-context";
import { AuthCard, Field } from "./auth-card";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const { user, hydrated, signIn } = useAccount();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (hydrated && user) router.replace(redirect);
  }, [hydrated, user, redirect, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn(email, password);
    if (res.ok) router.push(redirect);
    else setError(res.error);
  };

  const regHref = redirect !== "/" ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register";

  return (
    <AuthCard
      title="Нэвтрэх"
      subtitle="Бүртгэлтэй и-мэйл, нууц үгээрээ нэвтэрнэ үү."
      footer={
        <>
          Бүртгэл байхгүй юу?{" "}
          <Link href={regHref} className="font-medium text-brand hover:underline">
            Бүртгүүлэх
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>
        )}
        <Field
          label="И-Мэйл хаяг"
          required
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Нууц үг"
          required
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-brand py-3 font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          Нэвтрэх
        </button>
      </form>
    </AuthCard>
  );
}
