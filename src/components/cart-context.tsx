"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

export type CartLine = { product: Product; qty: number; flavor?: string };

// A product with a flavor selected is a distinct cart line from the same
// product with a different (or no) flavor.
export function lineKey(product: Product, flavor?: string) {
  return flavor ? `${product.id}::${flavor}` : product.id;
}

type CartState = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  add: (product: Product, qty?: number, flavor?: string) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "gainhub-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add: CartState["add"] = (product, qty = 1, flavor) => {
    setLines((prev) => {
      const key = lineKey(product, flavor);
      const existing = prev.find((l) => lineKey(l.product, l.flavor) === key);
      if (existing) {
        return prev.map((l) =>
          lineKey(l.product, l.flavor) === key ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { product, qty, flavor }];
    });
    setIsOpen(true);
  };

  const remove: CartState["remove"] = (key) =>
    setLines((prev) => prev.filter((l) => lineKey(l.product, l.flavor) !== key));

  const setQty: CartState["setQty"] = (key, qty) =>
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => lineKey(l.product, l.flavor) !== key)
        : prev.map((l) => (lineKey(l.product, l.flavor) === key ? { ...l, qty } : l))
    );

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
    return {
      lines,
      count,
      total,
      isOpen,
      add,
      remove,
      setQty,
      clear: () => setLines([]),
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    };
  }, [lines, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
