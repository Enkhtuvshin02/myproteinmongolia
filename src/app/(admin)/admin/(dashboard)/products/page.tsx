import Link from "next/link";
import { db } from "@/lib/db";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [products, total] = await Promise.all([
    db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        stock: true,
        isNew: true,
        isFeatured: true,
        isBundle: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
                  <DeleteProductButton id={p.id} name={p.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Бүтээгдэхүүн олдсонгүй.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <Link
            href={`/admin/products?page=${page - 1}`}
            aria-disabled={page <= 1}
            className={`rounded px-3 py-1.5 ${page <= 1 ? "pointer-events-none text-muted-foreground/40" : "text-foreground hover:bg-muted"}`}
          >
            ← Өмнөх
          </Link>
          <span className="text-muted-foreground">{page} / {totalPages}</span>
          <Link
            href={`/admin/products?page=${page + 1}`}
            aria-disabled={page >= totalPages}
            className={`rounded px-3 py-1.5 ${page >= totalPages ? "pointer-events-none text-muted-foreground/40" : "text-foreground hover:bg-muted"}`}
          >
            Дараах →
          </Link>
        </div>
      )}
    </div>
  );
}
