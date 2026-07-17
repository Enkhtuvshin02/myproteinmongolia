"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  products: number;
  orders: number;
  newCount: number;
  onTheWay: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/orders").then((r) => r.json()),
    ]).then(([products, orders]) => {
      setStats({
        products: products.length,
        orders: orders.length,
        newCount: orders.filter((o: { status: string }) => o.status === "NEW").length,
        onTheWay: orders.filter((o: { status: string }) => o.status === "ON_THE_WAY").length,
      });
    });
  }, []);

  const cards = [
    { label: "Нийт бүтээгдэхүүн", value: stats?.products, href: "/admin/products", color: "bg-muted text-foreground" },
    { label: "Нийт захиалга", value: stats?.orders, href: "/admin/orders", color: "bg-ink text-white" },
    { label: "Шинэ захиалга", value: stats?.newCount, href: "/admin/orders?status=NEW", color: "bg-rating/20 text-rating" },
    { label: "Хүргэлтэнд гарсан", value: stats?.onTheWay, href: "/admin/orders?status=ON_THE_WAY", color: "bg-brand/20 text-brand" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-lg p-5 ${card.color} transition-opacity hover:opacity-80`}
          >
            <div className="mb-1 text-3xl font-bold">
              {stats === null ? "—" : card.value}
            </div>
            <div className="text-sm font-medium">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
