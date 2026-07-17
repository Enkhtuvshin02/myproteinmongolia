import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <Link
      href="/product"
      className="relative block w-full aspect-[21/9] overflow-hidden select-none group border-b border-shop-line"
    >
      <Image
        src="/hero-bg.webp"
        alt="Myprotein Mongolia Banner"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.008]"
      />
    </Link>
  );
}
