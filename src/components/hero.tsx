import Link from "next/link";

export function Hero() {
  return (
    <Link
      href="/product"
      className="relative block w-full select-none group border-b border-shop-line"
    >
      <img
        src="/hero-bg.png"
        alt="Myprotein Mongolia Banner"
        className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.008]"
        loading="eager"
      />
    </Link>
  );
}
