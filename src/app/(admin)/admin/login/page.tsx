"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((user) => {
        if (user?.isAdmin) router.replace("/admin");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Нэвтрэхэд алдаа гарлаа.");
        return;
      }
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me?.isAdmin) {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("Энэ бүртгэл админ эрхгүй байна.");
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Сүлжээний алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-ink-soft p-8">
        <div className="mb-6 text-center">
          <span className="text-2xl font-extrabold tracking-tight text-white">
            <span className="text-brand">MyProtein</span> Mongolia
          </span>
          <p className="mt-1 text-sm text-white/50">Админ удирдлагын самбар</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">И-мэйл</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Нууц үг</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-ink px-3 text-sm text-white outline-none focus:border-brand"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-md bg-brand font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {submitting ? "Шалгаж байна…" : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </div>
  );
}
