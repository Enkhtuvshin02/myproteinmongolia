"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCart, lineKey } from "./cart-context";
import { formatPrice } from "@/lib/data";

// Mini-cart: auto-opens on add as quick feedback. Full editing happens on /cart.
export function CartDrawer() {
  const { lines, isOpen, closeCart, setQty, remove, total, count } = useCart();

  return (
    <>
      {/* overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingCart className="size-5" /> Сагс
            <span className="text-sm font-normal text-muted-foreground">({count})</span>
          </h2>
          <button onClick={closeCart} aria-label="Хаах" className="rounded-full p-1 hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShoppingCart className="size-12" />
            <p>Таны сагс хоосон байна</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map(({ product, qty, flavor }) => {
                const key = lineKey(product, flavor);
                return (
                  <div key={key} className="flex gap-3 rounded-card border border-border-subtle p-2">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                      {flavor && <span className="text-xs text-muted-foreground">Амт: {flavor}</span>}
                      <span className="text-sm font-bold text-brand">{formatPrice(product.price)}</span>
                      <div className="mt-auto flex items-center gap-2">
                        <div className="flex items-center rounded-md border border-border-subtle">
                          <button onClick={() => setQty(key, qty - 1)} className="grid size-7 place-items-center hover:bg-muted" aria-label="Хасах">
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm">{qty}</span>
                          <button onClick={() => setQty(key, qty + 1)} className="grid size-7 place-items-center hover:bg-muted" aria-label="Нэмэх">
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button onClick={() => remove(key)} className="ml-auto p-1 text-muted-foreground hover:text-brand" aria-label="Устгах">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border-subtle p-4">
              <div className="mb-3 flex items-center justify-between text-base">
                <span className="text-muted-foreground">Нийт дүн</span>
                <span className="text-xl font-bold">{formatPrice(total)}</span>
              </div>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full rounded-lg bg-brand py-3 text-center font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
              >
                Сагс үзэх
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
