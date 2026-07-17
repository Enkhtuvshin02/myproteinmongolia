import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  // Determine if we should use the white text version for a dark background (e.g., in footer)
  const isDarkContext = className.includes("text-white") || className.includes("white");

  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      <img
        src={isDarkContext ? "/logo-white.png" : "/logo.png"}
        alt="Myprotein Mongolia"
        className="h-[38px] w-auto object-contain"
      />
    </Link>
  );
}
