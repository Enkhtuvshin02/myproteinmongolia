"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  isBundle: boolean;
  category: { name: string };
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  };

  useEffect(load, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" бүтээгдэхүүнийг устгах уу?`)) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Бүтээгдэхүүн</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
        >
          + Шинэ бүтээгдэхүүн
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Уншиж байна...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Нэр</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Ангилал</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Үнэ</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Нөөц</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Шинэ</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Онцлох</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Bundle</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border-subtle last:border-0 hover:bg-muted/40">
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                  <td className="px-4 py-3">
                    ₮{p.price.toLocaleString()}
                    {p.originalPrice && (
                      <span className="ml-1 text-xs text-muted-foreground line-through">
                        ₮{p.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block size-2 rounded-full ${p.isNew ? "bg-success" : "bg-border-subtle"}`} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block size-2 rounded-full ${p.isFeatured ? "bg-brand" : "bg-border-subtle"}`} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block size-2 rounded-full ${p.isBundle ? "bg-ink" : "bg-border-subtle"}`} />
                  </td>
                  <td className="flex justify-end gap-3 px-4 py-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-brand hover:underline">
                      Засах
                    </Link>
                    <button onClick={() => handleDelete(p.id, p.name)} className="text-sale hover:underline">
                      Устгах
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">Бүтээгдэхүүн олдсонгүй.</p>
          )}
        </div>
      )}
    </div>
  );
}
