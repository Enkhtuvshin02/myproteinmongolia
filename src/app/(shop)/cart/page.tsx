"use client";

import Image from "next/image";
import Link from "next/link";

import { Heart, Minus, Package, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart, lineKey } from "@/components/cart-context";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { OrderSummary } from "@/components/checkout/order-summary";
import { formatPrice } from "@/lib/data";
export default function CartPage() {
  const { lines, setQty, remove, clear, total } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-6">
        <CheckoutSteps active={0} />
        <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-border-subtle py-20 text-center">
          <ShoppingCart className="size-14 text-muted-foreground" />
          <p className="text-lg font-medium">Таны сагс хоосон байна</p>
          <Link href="/product" className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-brand-foreground hover:bg-brand-hover">
            Дэлгүүр хэсэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <CheckoutSteps active={0} />

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Таны сагс</h1>
            <button
              onClick={clear}
              className="flex items-center gap-1.5 rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <Trash2 className="size-4" /> Сагс хоослох
            </button>
          </div>

          <div className="overflow-hidden rounded-card border border-border-subtle">
            <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Package className="size-5 text-brand" />
                <div>
                  <p className="text-sm font-semibold">Энгийн хүргэлт</p>
                  <p className="text-xs text-muted-foreground">24-48 цагийн хооронд хүргэгдэнэ.</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">Бүтээгдэхүүн ({lines.length})</span>
            </div>

            <ul>
              {lines.map(({ product, qty, flavor }) => {
                const key = lineKey(product, flavor);
                return (
                  <li key={key} className="flex flex-col gap-3 border-b border-border-subtle p-4 last:border-0 sm:flex-row sm:items-center">
                    <Link href={`/product/${product.id}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                    </Link>

                    <div className="flex-1">
                      <Link href={`/product/${product.id}`} className="line-clamp-2 text-sm font-medium hover:text-brand">
                        {product.name}
                      </Link>
                      {flavor && <p className="mt-0.5 text-xs text-muted-foreground">Амт: {flavor}</p>}
                      <p className="mt-1 text-xs text-sale">Үлдэгдэл: {product.stock}</p>
                      {product.originalPrice && (
                        <span className="mt-1 block text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-sm font-bold text-brand">{formatPrice(product.price)}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-lg border border-border-subtle">
                        <button onClick={() => setQty(key, qty - 1)} className="grid size-9 place-items-center hover:bg-muted" aria-label="Хасах">
                          <Minus className="size-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{qty}</span>
                        <button onClick={() => setQty(key, qty + 1)} className="grid size-9 place-items-center hover:bg-muted" aria-label="Нэмэх">
                          <Plus className="size-4" />
                        </button>
                      </div>
                      <span className="hidden w-28 text-right text-sm font-semibold sm:block">
                        {formatPrice(product.price * qty)}
                      </span>
                      <button aria-label="Хадгалах" className="grid size-9 place-items-center rounded-lg border border-border-subtle text-muted-foreground hover:text-brand">
                        <Heart className="size-4" />
                      </button>
                      <button onClick={() => remove(key)} aria-label="Устгах" className="grid size-9 place-items-center rounded-lg border border-border-subtle text-muted-foreground hover:text-sale">
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="lg:sticky lg:top-4">
            <OrderSummary
              subtotal={total}
              cta={{ label: "Үргэлжлүүлэх", href: "/checkout" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
