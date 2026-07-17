import Link from "next/link";

export function Hero() {
  return (
    <Link
      href="/product"
      className="relative block w-full select-none group border-b border-shop-line"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg.png"
        alt="Myprotein Mongolia Banner"
        className="w-full block transition-transform duration-700 group-hover:scale-[1.008]"
        style={{ maxHeight: "460px", objectFit: "cover", objectPosition: "center center" }}
        loading="eager"
      />
    </Link>
  );
}
