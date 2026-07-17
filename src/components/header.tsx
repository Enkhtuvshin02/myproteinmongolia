"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "./cart-context";
import { AccountMenu } from "./account-menu";
import { formatPrice } from "@/lib/data";

const NAV_LINKS = [
  { slug: "whey", label: "Уураг" },
  { slug: "creatine", label: "Креатин" },
  { slug: "preworkout", label: "Пре-Воркаут" },
  { slug: "bcaa", label: "Витамин" },
  { slug: "bundle", label: "Иж бүрдэл" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false);
  const { count, total } = useCart();

  // Cart state comes from localStorage, so only reflect it after mount to
  // avoid a server/client hydration mismatch on the count badge / total.
  useEffect(() => setMounted(true), []);

  // keep the box in sync with the URL query (e.g. when on /product?q=...)
  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const activeSlug = pathname === "/product" ? params.get("category") : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/product?q=${encodeURIComponent(query)}` : "/product");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-shop-line bg-background">
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-4">
        <Logo className="shrink-0" />

        <nav className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.slug}
              href={`/product?category=${l.slug}`}
              className={`text-xs font-semibold uppercase tracking-wide transition-colors hover:text-brand ${
                activeSlug === l.slug ? "text-brand" : "text-foreground/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="relative ml-auto hidden max-w-[220px] flex-1 md:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Хайх..."
            className="h-9 w-full border border-shop-line bg-shop-paper pl-3 pr-9 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            aria-label="Хайх"
            className="absolute right-0 top-0 grid h-9 w-9 place-items-center text-foreground/60 hover:text-brand"
          >
            <Search className="size-4" />
          </button>
        </form>

        <div className="flex items-center gap-1 md:ml-2">
          <button
            aria-label="Хадгалсан"
            className="hidden size-9 place-items-center text-foreground/70 hover:text-brand sm:grid"
          >
            <Heart className="size-[18px]" />
          </button>

          <Link
            href="/cart"
            aria-label="Сагс"
            className="flex items-center gap-2 px-2 py-1.5 hover:text-brand"
          >
            <span className="relative grid size-7 place-items-center">
              <ShoppingCart className="size-[18px]" />
              {mounted && count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-4 text-brand-foreground">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden text-left text-xs leading-tight sm:block">
              <span className="block font-semibold">{formatPrice(mounted ? total : 0)}</span>
            </span>
          </Link>

          <AccountMenu />
        </div>
      </div>

      {/* mobile search */}
      <form onSubmit={submit} className="relative px-4 pb-3 md:hidden">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Бүтээгдэхүүн хайх.."
          className="h-10 w-full border border-shop-line bg-shop-paper pl-3 pr-10 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          aria-label="Хайх"
          className="absolute right-6 top-0 grid h-10 w-8 place-items-center text-foreground/60"
        >
          <Search className="size-4" />
        </button>
      </form>
    </header>
  );
}
