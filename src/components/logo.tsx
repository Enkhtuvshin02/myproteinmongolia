import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-0.5 ${className}`}>
      <span className="text-2xl font-extrabold leading-none flex items-center gap-0.5">
        <span className="text-foreground">Gain</span>
        <span className="rounded bg-brand px-1.5 py-0.5 text-white">Hub</span>
      </span>
    </Link>
  );
}
