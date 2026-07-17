"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { X } from "lucide-react";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/checkout";
import { districtLabel } from "@/lib/mn-address";

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  custFirstName: string;
  custLastName: string;
  phonePrimary: string;
  phoneSecondary: string;
  district: string;
  khoroo: string;
  detailedAddress: string;
  receiptImageUrl: string | null;
  items: { qty: number; product: { name: string } }[];
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-rating/20 text-rating",
  PAID: "bg-success/20 text-success",
  ON_THE_WAY: "bg-brand/20 text-brand",
  COMPLETED: "bg-success/20 text-success",
  CANCELED: "bg-sale/20 text-sale",
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function OrdersTable() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const url = statusFilter ? `/api/admin/orders?status=${statusFilter}` : "/api/admin/orders";
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setOrders(data); setLoading(false); });
  }, [statusFilter]);

  useEffect(load, [load]);

  const changeStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    setUpdating(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-bold">Захиалга</h1>
        <div className="ml-4 flex gap-1.5">
          {(["", ...ORDER_STATUS_FLOW] as const).map((s) => (
            <a
              key={s}
              href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-ink text-white" : "bg-muted text-muted-foreground hover:bg-border-subtle"
              }`}
            >
              {s ? ORDER_STATUS_LABELS[s] : "Бүгд"}
            </a>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Уншиж байна...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Захиалга / Огноо</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Хэрэглэгч</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Утас</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Хаяг</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Дүн</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Баримт</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Статус</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border-subtle last:border-0 hover:bg-muted/40">
                  <td className="px-3 py-2 align-top">
                    <div className="font-mono text-xs font-semibold">{o.id}</div>
                    <div className="text-xs text-muted-foreground">{fmtDateTime(o.createdAt)}</div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="font-medium">{o.custLastName} {o.custFirstName}</div>
                    <div className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)} ш</div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <a href={`tel:${o.phonePrimary}`} className="block text-brand hover:underline">{o.phonePrimary}</a>
                    <a href={`tel:${o.phoneSecondary}`} className="block text-xs text-muted-foreground hover:underline">{o.phoneSecondary}</a>
                  </td>
                  <td className="max-w-[220px] px-3 py-2 align-top text-xs text-muted-foreground">
                    {districtLabel(o.district)}, {o.khoroo}, {o.detailedAddress}
                  </td>
                  <td className="px-3 py-2 align-top font-semibold">₮{o.total.toLocaleString()}</td>
                  <td className="px-3 py-2 align-top">
                    {o.receiptImageUrl ? (
                      <button onClick={() => setReceiptPreview(o.receiptImageUrl)} className="relative block size-10 overflow-hidden rounded border border-border-subtle">
                        <Image src={o.receiptImageUrl} alt="Баримт" fill sizes="40px" className="object-cover" />
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <select
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                      className={`cursor-pointer rounded border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ink ${STATUS_COLORS[o.status]}`}
                    >
                      {ORDER_STATUS_FLOW.map((s) => (
                        <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Захиалга олдсонгүй.</p>
          )}
        </div>
      )}

      {receiptPreview && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={() => setReceiptPreview(null)}>
          <button onClick={() => setReceiptPreview(null)} aria-label="Хаах" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="size-5" />
          </button>
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image src={receiptPreview} alt="Гүйлгээний баримт" width={900} height={1200} className="h-auto max-h-[85vh] w-auto rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersTable />
    </Suspense>
  );
}
