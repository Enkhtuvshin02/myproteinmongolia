"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { useCart } from "./cart-context";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [flavor, setFlavor] = useState<string | null>(null);
  const hasFlavors = (product.flavors?.length ?? 0) > 0;
  const needsFlavor = hasFlavors && !flavor;

  const discount = !product.isBundle && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const savings = product.isBundle && product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  const handleAdd = () => {
    if (needsFlavor) return;
    add(product, 1, flavor ?? undefined);
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-border-subtle bg-background transition-shadow hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.isBundle && savings > 0 && (
          <span className="absolute left-2 top-2 rounded bg-brand px-1.5 py-0.5 text-xs font-bold text-brand-foreground">
            Хэмнэлт: {formatPrice(savings)}
          </span>
        )}
        {!product.isBundle && discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-sale px-1.5 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.isNew && (
          <span className="absolute right-2 top-2 rounded bg-success px-1.5 py-0.5 text-xs font-bold text-white">
            Шинэ
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium hover:text-brand"
        >
          {product.name}
        </Link>

        {hasFlavors && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.flavors!.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFlavor(f.flavorName)}
                className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  flavor === f.flavorName
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border-subtle text-muted-foreground hover:border-brand/60"
                }`}
              >
                {f.flavorName}
              </button>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-end justify-between">
          <div>
            {product.isBundle && product.originalPrice && (
              <span className="block text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {!product.isBundle && product.originalPrice && (
              <span className="block text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-base font-bold">{formatPrice(product.price)}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={needsFlavor}
            aria-label={needsFlavor ? "Эхлээд амт сонгоно уу" : "Сагсанд хийх"}
            title={needsFlavor ? "Эхлээд амт сонгоно уу" : undefined}
            className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-foreground transition-colors hover:bg-brand hover:text-brand-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-foreground"
          >
            <ShoppingCart className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
