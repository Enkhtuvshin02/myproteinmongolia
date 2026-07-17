"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Search, ShoppingCart } from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "./cart-context";
import { AccountMenu } from "./account-menu";
import { formatPrice } from "@/lib/data";

export function Header() {
  const router = useRouter();
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/product?q=${encodeURIComponent(query)}` : "/product");
  };

  return (
    <header className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-3">
        <Logo className="shrink-0" />

        <form onSubmit={submit} className="relative mx-2 hidden flex-1 md:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Бүтээгдэхүүн хайх.."
            className="h-11 w-full rounded-full border border-border-subtle bg-muted/60 pl-5 pr-28 text-sm outline-none focus:border-brand focus:bg-background"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 flex h-8 items-center gap-1.5 rounded-full bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            <Search className="size-4" />
            Хайх
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            aria-label="Хадгалсан"
            className="relative grid size-10 place-items-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <Heart className="size-5" />
          </button>

          <Link
            href="/cart"
            aria-label="Сагс"
            className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-muted"
          >
            <span className="relative grid size-7 place-items-center">
              <ShoppingCart className="size-5" />
              {mounted && count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-4 text-brand-foreground">
                  {count}
                </span>
              )}
            </span>
            <span className="hidden text-left text-xs leading-tight sm:block">
              <span className="block text-muted-foreground">Сагс</span>
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
          className="h-11 w-full rounded-full border border-border-subtle bg-muted/60 pl-5 pr-12 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          aria-label="Хайх"
          className="absolute right-6 top-1.5 grid size-8 place-items-center rounded-full bg-brand text-brand-foreground"
        >
          <Search className="size-4" />
        </button>
      </form>
    </header>
  );
}
