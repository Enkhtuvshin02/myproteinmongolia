import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CreditCard, Phone, ShieldCheck, Truck } from "lucide-react";
import { categories, products } from "@/lib/data";

const QUICK_CATS = ["whey", "creatine", "preworkout", "bcaa"];

const VALUE_PROPS = [
  { icon: Truck,       title: "Шуурхай хүргэлт",    sub: "Улаанбаатарт 24–48 цаг" },
  { icon: ShieldCheck, title: "100% Original",       sub: "Лабораторийн баталгаатай" },
  { icon: CreditCard,  title: "Хялбар төлбөр",      sub: "Банкны шилжүүлэг"       },
  { icon: Phone,       title: "Лавлах утас",         sub: "77100100 — өдөр бүр"    },
];

export function Hero() {
  const catTiles = QUICK_CATS
    .map((slug) => {
      const cat   = categories.find((c) => c.slug === slug);
      const image = products.find((p) => p.categorySlug === slug)?.image;
      return cat && image ? { ...cat, image } : null;
    })
    .filter((t): t is { slug: string; name: string; image: string } => t !== null);

  return (
    <div className="mx-auto max-w-[1280px] space-y-3 px-4 pt-4">

      {/* ── Main hero ─────────────────────────────────────────── */}
      <div className="flex min-h-[300px] flex-col overflow-hidden rounded-lg bg-ink sm:flex-row sm:min-h-[340px]">

        {/* Left — headline + CTAs */}
        <div className="flex flex-col justify-center gap-5 px-8 py-10 sm:w-[54%] sm:px-12">

          {/* Live badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/60">
            <span className="size-1.5 rounded-full bg-brand" />
            Улаанбаатарт 24–48 цагт хүргэнэ
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.15] tracking-tight text-white">
              Дараагийн PR-аа<br />
              <span className="text-brand">GainHub</span>-аар эхлүүл
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50 sm:text-[0.9375rem]">
              Whey уураг, креатин, дасгалын өмнөх, амин хүчил —<br className="hidden sm:block" />
              дэлхийн шилдэг брэндүүд боломжийн үнээр.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/product"
              className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              Бараа үзэх <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/product?filter=sale"
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-6 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15"
            >
              Хямдралтай бараа
            </Link>
          </div>
        </div>

        {/* Right — 2×2 category image grid */}
        <div className="grid grid-cols-2 gap-2 p-3 sm:w-[46%] sm:p-4">
          {catTiles.map((cat) => (
            <Link
              key={cat.slug}
              href={`/product?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width:640px) 50vw, 23vw"
                  className="object-cover brightness-75 transition-all duration-500 group-hover:brightness-90 group-hover:scale-105"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* label */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-2.5 sm:p-3">
                  <span className="text-xs font-semibold text-white drop-shadow sm:text-sm">{cat.name}</span>
                  <ArrowRight className="size-3.5 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Value-props strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {VALUE_PROPS.map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-lg border border-border-subtle bg-background px-4 py-3"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
