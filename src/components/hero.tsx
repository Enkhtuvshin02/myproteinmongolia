import Link from "next/link";

export function Hero() {
  return (
    <Link
      href="/product"
      // 1. Added overflow-hidden to prevent the hover scale effect from spilling out
      className="relative block w-full overflow-hidden select-none group border-b border-shop-line"
    >
      <img
        src="/hero-bg.png"
        alt="Myprotein Mongolia Banner"
        // 2. Removed `h-auto`
        // 3. Added `aspect-[21/9]`, `object-cover`, and `object-top`
        className="w-full aspect-[21/9] object-cover object-top block transition-transform duration-700 group-hover:scale-[1.008]"
        loading="eager"
      />
    </Link>
  );
}