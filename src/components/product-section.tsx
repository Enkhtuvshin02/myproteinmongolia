import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  href = "/product",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10">
      <div className="mb-6 flex items-end justify-between border-b border-shop-line pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">{eyebrow}</span>
          <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-normal">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link href={href} className="hidden shrink-0 text-xs font-bold uppercase tracking-wide text-brand hover:underline sm:block">
          Бүгдийг харах →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
