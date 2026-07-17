import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, statusCounts] = await Promise.all([
    db.product.count(),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (status: string) =>
    statusCounts.find((r) => r.status === status)?._count ?? 0;
  const orders = statusCounts.reduce((sum, r) => sum + r._count, 0);

  const cards = [
    { label: "Нийт бүтээгдэхүүн", value: products, href: "/admin/products", color: "bg-muted text-foreground" },
    { label: "Нийт захиалга", value: orders, href: "/admin/orders", color: "bg-ink text-white" },
    { label: "Шинэ захиалга", value: countFor("NEW"), href: "/admin/orders?status=NEW", color: "bg-rating/20 text-rating" },
    { label: "Хүргэлтэнд гарсан", value: countFor("ON_THE_WAY"), href: "/admin/orders?status=ON_THE_WAY", color: "bg-brand/20 text-brand" },
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
            <div className="mb-1 text-3xl font-bold">{card.value}</div>
            <div className="text-sm font-medium">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
