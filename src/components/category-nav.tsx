"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories } from "@/lib/data";

const featuredSlugs = ["whey", "creatine", "preworkout", "bcaa", "bundle"];

const tiles = featuredSlugs
  .map((slug) => categories.find((c) => c.slug === slug))
  .filter(Boolean) as { slug: string; name: string }[];

function CategoryLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug = pathname === "/product" ? searchParams.get("category") : null;

  return (
    <>
      {tiles.map((c) => (
        <Link
          key={c.slug}
          href={`/product?category=${c.slug}`}
          className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-1 text-xs font-medium transition-colors hover:bg-muted ${
            activeSlug === c.slug ? "bg-brand/10 text-brand" : "text-foreground"
          }`}
        >
          <div className="relative size-7 shrink-0 overflow-hidden rounded-md bg-muted">
            <Image
              src={`/icons/${c.slug}.svg`}
              alt={c.name}
              fill
              sizes="28px"
              className="object-contain p-0.5"
            />
          </div>
          {c.name}
        </Link>
      ))}
    </>
  );
}

export function CategoryNav() {
  return (
    <nav className="border-b border-border-subtle bg-background">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          <Suspense fallback={
            tiles.map((c) => (
              <div key={c.slug} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-1 text-xs font-medium text-foreground">
                <div className="size-7 rounded-md bg-muted" />
                {c.name}
              </div>
            ))
          }>
            <CategoryLinks />
          </Suspense>
        </div>

        <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Truck className="size-4 text-brand" />
          Улаанбаатар хотод 24-48 цагт хүргэнэ
        </span>
      </div>
    </nav>
  );
}
