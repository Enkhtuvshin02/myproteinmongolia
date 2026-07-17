"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, categoryName } from "@/lib/data";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

const filterChips = [
  { key: "featured", label: "Онцлох" },
  { key: "new", label: "Шинэ" },
  { key: "sale", label: "Хямдралтай" },
];

type Sort = "default" | "price-asc" | "price-desc";

export function ProductListing() {
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const q = (params.get("q") ?? "").trim();
  const filter = params.get("filter") ?? "";
  const [sort, setSort] = useState<Sort>("default");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (filter) sp.set("filter", filter);
    if (q) sp.set("q", q);
    fetch(`/api/products${sp.toString() ? `?${sp}` : ""}`)
      .then((r) => r.json())
      .then((data: Product[]) => setAllProducts(data))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [category, filter, q]);

  const list = useMemo(() => {
    let out = [...allProducts];
    if (sort === "price-asc") out = out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out = out.sort((a, b) => b.price - a.price);
    return out;
  }, [allProducts, sort]);

  const heading = q
    ? `"${q}" — хайлтын үр дүн`
    : category
    ? categoryName(category)
    : filter
    ? filterChips.find((f) => f.key === filter)?.label ?? "Бараа бүтээгдэхүүн"
    : "Бараа бүтээгдэхүүн";

  const linkWith = (next: Record<string, string>) => {
    const sp = new URLSearchParams();
    const merged = { category, q, filter, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const s = sp.toString();
    return s ? `/product?${s}` : "/product";
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* sidebar */}
        <aside className="w-full shrink-0 lg:w-60">
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Шүүлтүүр</h3>
            <ul className="space-y-1">
              {filterChips.map((f) => (
                <li key={f.key}>
                  <Link
                    href={linkWith({ filter: filter === f.key ? "" : f.key })}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                      filter === f.key ? "bg-brand/10 font-medium text-brand" : "hover:bg-muted"
                    }`}
                  >
                    <span className={`size-3.5 rounded-full border ${filter === f.key ? "border-brand bg-brand" : "border-border-subtle"}`} />
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Ангилал</h3>
          <ul className="space-y-0.5">
            <li>
              <Link href={linkWith({ category: "" })} className={`block rounded-md px-3 py-1.5 text-sm ${!category ? "bg-muted font-medium text-brand" : "hover:bg-muted"}`}>
                Бүгд
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={linkWith({ category: c.slug })}
                  className={`block rounded-md px-3 py-1.5 text-sm ${category === c.slug ? "bg-muted font-medium text-brand" : "hover:bg-muted"}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* grid */}
        <section className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">
              {heading}
              {!loading && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {list.length} бүтээгдэхүүн
                </span>
              )}
            </h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-md border border-border-subtle bg-background px-3 py-1.5 text-sm outline-none focus:border-brand"
            >
              <option value="default">Эрэмбэлэх</option>
              <option value="price-asc">Үнэ: багаас их</option>
              <option value="price-desc">Үнэ: ихээс бага</option>
            </select>
          </div>

          {loading ? (
            <p className="py-20 text-center text-muted-foreground">Уншиж байна…</p>
          ) : list.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">Бүтээгдэхүүн олдсонгүй.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
