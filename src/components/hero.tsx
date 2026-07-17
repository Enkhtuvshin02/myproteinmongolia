import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-shop-black py-24 sm:py-32 lg:py-40">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/hero-bg.png"
          alt="Modern Gym background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-shop-black via-shop-black/85 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-4">
        <div className="max-w-2xl">
          <span className="inline-block bg-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
            Шинэ ирэлт · MP-2026
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,5.25rem)] font-bold uppercase leading-[0.92] tracking-normal text-white">
            Дараагийн PR-аа
            <br />
            <span className="text-brand">Энд эхэл.</span>
          </h1>

          <p className="mt-6 max-w-lg text-[15px] sm:text-base leading-relaxed text-white/70">
            Лабораторийн шалгалттай whey уураг, креатин, дасгалын өмнөх —
            100% original, Улаанбаатарт 24–48 цагт хүргэнэ.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/product"
              className="flex items-center gap-2 bg-brand px-8 py-4 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-hover"
            >
              Бараа үзэх <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/product?filter=sale"
              className="flex items-center gap-2 border border-white/25 px-8 py-4 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Хямдралтай бараа
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
