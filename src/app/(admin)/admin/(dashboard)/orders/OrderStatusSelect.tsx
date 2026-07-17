"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/checkout";

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-rating/20 text-rating",
  PAID: "bg-success/20 text-success",
  ON_THE_WAY: "bg-brand/20 text-brand",
  COMPLETED: "bg-success/20 text-success",
  CANCELED: "bg-sale/20 text-sale",
};

export function OrderStatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const changeStatus = async (newStatus: OrderStatus) => {
    setUpdating(true);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setUpdating(false);
  };

  return (
    <select
      value={status}
      disabled={updating}
      onChange={(e) => changeStatus(e.target.value as OrderStatus)}
      className={`cursor-pointer rounded border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ink ${STATUS_COLORS[status]}`}
    >
      {ORDER_STATUS_FLOW.map((s) => (
        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
