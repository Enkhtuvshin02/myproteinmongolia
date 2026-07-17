import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatPrice, getProduct } from "@/lib/data";

const HERO_PRODUCT_ID = "gh-1001";

export function Hero() {
  const heroProduct = getProduct(HERO_PRODUCT_ID);
  const discount =
    heroProduct?.originalPrice
      ? Math.round((1 - heroProduct.price / heroProduct.originalPrice) * 100)
      : 0;

  return (
    <div className="bg-shop-black">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-8">
        {/* Left — headline + CTAs */}
        <div className="order-2 lg:order-1">
          <span className="inline-block bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            Шинэ ирэлт · MP-2026
          </span>

          <h1 className="mt-5 font-display text-[clamp(2.75rem,7vw,5.25rem)] font-bold uppercase leading-[0.92] tracking-normal text-white">
            Дараагийн PR-аа
            <br />
            <span className="text-brand">Энд эхэл.</span>
          </h1>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/50">
            Лабораторийн шалгалттай whey уураг, креатин, дасгалын өмнөх —
            100% original, Улаанбаатарт 24–48 цагт хүргэнэ.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/product"
              className="flex items-center gap-2 bg-brand px-7 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-hover"
            >
              Бараа үзэх <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/product?filter=sale"
              className="flex items-center gap-2 border border-white/25 px-7 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Хямдралтай бараа
            </Link>
          </div>
        </div>

        {/* Right — hero product on a pedestal */}
        {heroProduct && (
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-square max-w-[420px] bg-gradient-to-b from-white/[0.07] to-transparent p-10">
              <div className="relative size-full">
                <Image
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  fill
                  sizes="(max-width:1024px) 80vw, 420px"
                  className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
                  priority
                />
              </div>
              {discount > 0 && (
                <div className="absolute bottom-4 left-4 bg-brand px-3 py-2 text-sm font-black uppercase tracking-wide text-white">
                  -{discount}% онцлох
                </div>
              )}
              <div className="absolute right-4 top-4 border border-white/20 bg-shop-black/80 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                {formatPrice(heroProduct.price)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
