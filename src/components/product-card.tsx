"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Plus } from "lucide-react";
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
    <div className="group flex flex-col border border-shop-line bg-background transition-colors hover:border-shop-black">
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-shop-paper">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
        />

        {product.isBundle && savings > 0 ? (
          <span className="absolute left-0 top-3 bg-brand px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Хэмнэлт {formatPrice(savings)}
          </span>
        ) : !product.isBundle && discount > 0 ? (
          <span className="absolute left-0 top-3 bg-sale px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            -{discount}%
          </span>
        ) : product.isNew ? (
          <span className="absolute left-0 top-3 bg-shop-black px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Шинэ
          </span>
        ) : null}

        <button
          type="button"
          aria-label="Хадгалах"
          onClick={(e) => e.preventDefault()}
          className="absolute right-2 top-2 grid size-8 place-items-center border border-shop-line bg-background/90 text-foreground/60 opacity-0 transition-opacity hover:text-brand group-hover:opacity-100"
        >
          <Heart className="size-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <Link
            href={`/product/${product.id}`}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-brand"
          >
            {product.name}
          </Link>
          {product.unit && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.unit}
            </p>
          )}
        </div>

        {hasFlavors && (
          <div className="flex flex-wrap gap-1.5">
            {product.flavors!.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFlavor(f.flavorName)}
                className={`border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  flavor === f.flavorName
                    ? "border-brand bg-brand text-white"
                    : "border-shop-line text-muted-foreground hover:border-brand/60"
                }`}
              >
                {f.flavorName}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-1">
          <div>
            {product.originalPrice && (
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
            className="flex shrink-0 items-center gap-1 border border-shop-black bg-shop-black px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand hover:border-brand disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-shop-black disabled:hover:border-shop-black"
          >
            <Plus className="size-3.5" /> Нэмэх
          </button>
        </div>
      </div>
    </div>
  );
}
