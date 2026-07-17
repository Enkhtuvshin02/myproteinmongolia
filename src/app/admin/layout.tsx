"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((user) => {
        if (!user?.isAdmin) router.replace("/");
        else setChecking(false);
      })
      .catch(() => router.replace("/"));
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-border-subtle border-t-ink" />
      </div>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Бүтээгдэхүүн" },
    { href: "/admin/orders", label: "Захиалга" },
  ];

  return (
    <div className="flex min-h-screen bg-muted/50">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border-subtle bg-background">
        <div className="border-b border-border-subtle px-5 py-4">
          <span className="text-lg font-bold tracking-tight">
            Gain<span className="rounded bg-brand px-1 py-0.5 text-white">Hub</span> Admin
          </span>
        </div>
        <nav className="flex-1 py-3">
          {navLinks.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border-subtle px-5 py-4">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Дэлгүүр рүү буцах
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
