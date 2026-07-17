"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Бүтээгдэхүүн" },
  { href: "/admin/orders", label: "Захиалга" },
  { href: "/admin/promotion", label: "Урамшуулал (Pop-up)" },
];

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  return (
    <>
      <nav className="flex-1 py-3">
        {NAV_LINKS.map((link) => {
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
      <div className="space-y-2 border-t border-border-subtle px-5 py-4">
        <Link href="/" className="block text-xs text-muted-foreground hover:text-foreground">
          ← Дэлгүүр рүү буцах
        </Link>
        <button
          onClick={logout}
          className="block text-xs text-muted-foreground hover:text-foreground"
        >
          Гарах
        </button>
      </div>
    </>
  );
}
