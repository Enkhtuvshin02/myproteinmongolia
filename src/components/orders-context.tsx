"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type Order, type OrderDraft } from "@/lib/checkout";
import type { CartLine } from "@/components/cart-context";
import { useAccount } from "@/components/account-context";

type PlaceOrderInput = OrderDraft & {
  id: string;
  items: CartLine[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
};

type OrdersState = {
  orders: Order[];
  hydrated: boolean;
  placeOrder: (draft: PlaceOrderInput) => Promise<Order>;
  getOrder: (id: string) => Order | undefined;
  refreshOrders: () => Promise<void>;
};

const OrdersContext = createContext<OrdersState | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: accountHydrated } = useAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!user) { setOrders([]); setHydrated(true); return; }
    try {
      const res = await fetch("/api/orders");
      if (res.ok) setOrders(await res.json());
    } catch { /* ignore */ }
    setHydrated(true);
  }, [user]);

  useEffect(() => {
    if (accountHydrated) refreshOrders();
  }, [accountHydrated, refreshOrders]);

  const placeOrder = async (draft: PlaceOrderInput): Promise<Order> => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (!res.ok) throw new Error("Захиалга үүсгэхэд алдаа гарлаа.");
    const order: Order = await res.json();
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        hydrated,
        placeOrder,
        getOrder: (id) => orders.find((o) => o.id === id),
        refreshOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within OrdersProvider");
  return ctx;
}
