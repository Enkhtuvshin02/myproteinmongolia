import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductSection({
  title,
  subtitle,
  products,
  href = "/product",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
}) {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
          Бүгдийг харах <ChevronRight className="size-4" />
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
