import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

const featuredSlugs = ["whey", "creatine", "preworkout", "bcaa", "bundle"];

const SUBTITLES: Record<string, string> = {
  whey: "ISO / BLEND / VEGAN",
  creatine: "MONOHYDRATE / HCL",
  preworkout: "ENERGY / PUMP",
  bcaa: "DAILY / IMMUNE",
  bundle: "STACK / SAVINGS",
};

export function CategoryShowcase() {
  const tiles = featuredSlugs
    .map((slug) => {
      const cat = categories.find((c) => c.slug === slug);
      return cat ? { slug: cat.slug, name: cat.name } : null;
    })
    .filter((t): t is { slug: string; name: string } => t !== null);

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14">
      <div className="mb-6 flex items-end justify-between border-b border-shop-line pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">01 — Ангилал</span>
          <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-normal">Зорилгоороо дэлгүүр хэс</h2>
        </div>
        <Link href="/product" className="hidden text-xs font-bold uppercase tracking-wide text-brand hover:underline sm:block">
          Бүгдийг харах →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-px bg-shop-line sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.slug} href={`/product?category=${t.slug}`} className="group bg-background p-5">
            <div className="relative aspect-square overflow-hidden bg-shop-paper">
              <Image
                src={`/icons/${t.slug}.svg`}
                alt={t.name}
                fill
                sizes="(max-width:640px) 45vw, 20vw"
                className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="mt-3 text-sm font-bold uppercase tracking-wide group-hover:text-brand">{t.name}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {SUBTITLES[t.slug]}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
