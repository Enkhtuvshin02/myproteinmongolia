"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { categoryName, formatPrice } from "@/lib/data";
import { useCart } from "./cart-context";

export function ProductDetail({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);
  const hasFlavors = (product.flavors?.length ?? 0) > 0;
  const [flavor, setFlavor] = useState<string | null>(null);
  const needsFlavor = hasFlavors && !flavor;

  const savings = product.isBundle && product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  const addToCart = () => {
    if (needsFlavor) return;
    add(product, qty, flavor ?? undefined);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      {/* breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-brand">Нүүр</Link>
        <span>/</span>
        <Link href="/product" className="hover:text-brand">Бүтээгдэхүүн</Link>
        <span>/</span>
        <Link href={`/product?category=${product.categorySlug}`} className="hover:text-brand">{categoryName(product.categorySlug)}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* gallery */}
        <div className="relative">
          <Image
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="w-full h-auto rounded-card"
          />
          {product.isBundle && savings > 0 && (
            <span className="absolute left-3 top-3 rounded bg-brand px-2 py-1 text-sm font-bold text-brand-foreground">
              Хэмнэлт: {formatPrice(savings)}
            </span>
          )}
        </div>

        {/* info */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <button aria-label="Хадгалах" className="grid size-10 shrink-0 place-items-center rounded-lg border border-border-subtle hover:bg-muted">
              <Heart className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex items-end gap-3">
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
          </div>

          {/* flavor selector */}
          {hasFlavors && (
            <div className="mt-5">
              <span className="mb-2 block text-sm font-medium">
                Амт сонгох {needsFlavor && <span className="text-sale">*</span>}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.flavors!.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFlavor(f.flavorName)}
                    disabled={f.stock <= 0}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      flavor === f.flavorName
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border-subtle hover:border-brand/60"
                    }`}
                  >
                    {f.flavorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* quantity */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-medium">Тоо хэмжээ</span>
            <div className="flex items-center rounded-lg border border-border-subtle">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-9 place-items-center hover:bg-muted" aria-label="Хасах">
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="grid size-9 place-items-center hover:bg-muted" aria-label="Нэмэх">
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">Үлдэгдэл {product.stock}</p>

          {/* actions */}
          <div className="mt-5 space-y-2.5">
            <button
              onClick={addToCart}
              disabled={needsFlavor}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-3 text-sm font-medium transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="size-4" />
              {needsFlavor ? "Эхлээд амт сонгоно уу" : `Сагсанд хийх · ${formatPrice(product.price * qty)}`}
            </button>
            <button
              onClick={() => { if (!needsFlavor) { addToCart(); openCart(); } }}
              disabled={needsFlavor}
              className="w-full rounded-lg bg-brand py-3 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Худалдаж авах
            </button>
          </div>

          {/* details */}
          <div className="mt-8 border-t border-border-subtle pt-5">
            <h3 className="mb-3 font-semibold">Бүтээгдэхүүний дэлгэрэнгүй</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-border-subtle/60 pb-2">
                <dt className="text-muted-foreground">Ангилал</dt>
                <dd>{categoryName(product.categorySlug)}</dd>
              </div>
              {product.unit && (
                <div className="flex justify-between border-b border-border-subtle/60 pb-2">
                  <dt className="text-muted-foreground">Хэмжих нэгж</dt>
                  <dd>{product.unit}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Нөөц</dt>
                <dd className="text-success">Бэлэн ({product.stock})</dd>
              </div>
            </dl>
          </div>

        </div>
      </div>
    </div>
  );
}
