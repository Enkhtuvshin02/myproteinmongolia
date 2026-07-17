import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

const featuredSlugs = ["whey", "creatine", "preworkout", "bcaa", "bundle"];

export function CategoryShowcase() {
  const tiles = featuredSlugs
    .map((slug) => {
      const cat = categories.find((c) => c.slug === slug);
      return cat ? { slug: cat.slug, name: cat.name } : null;
    })
    .filter((t): t is { slug: string; name: string } => t !== null);

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-8">
      <h2 className="mb-4 text-xl font-bold sm:text-2xl">Ангиллаар дэлгүүр хэсэх</h2>
      <div className="flex flex-wrap gap-2">
        {tiles.map((t) => (
          <Link
            key={t.slug}
            href={`/product?category=${t.slug}`}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="relative size-12 overflow-hidden rounded-lg border border-border-subtle bg-white transition-shadow group-hover:shadow-md sm:size-14">
              <Image
                src={`/icons/${t.slug}.svg`}
                alt={t.name}
                fill
                sizes="56px"
                className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-center text-xs font-medium group-hover:text-brand">
              {t.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
