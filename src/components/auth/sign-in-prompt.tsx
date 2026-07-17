import Link from "next/link";
import { Lock } from "lucide-react";

// Shown on protected pages (orders, profile) when the visitor isn't signed in.
export function SignInPrompt({ redirect }: { redirect: string }) {
  const href = `/login?redirect=${encodeURIComponent(redirect)}`;
  return (
    <div className="mx-auto flex max-w-[800px] flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <Lock className="size-7" />
      </span>
      <p className="text-lg font-medium">Энэ хуудсыг үзэхийн тулд нэвтэрнэ үү</p>
      <div className="flex gap-3">
        <Link href={href} className="rounded-lg bg-brand px-6 py-2.5 font-semibold text-brand-foreground hover:bg-brand-hover">
          Нэвтрэх
        </Link>
        <Link href="/register" className="rounded-lg border border-border-subtle px-6 py-2.5 font-medium hover:bg-muted">
          Бүртгүүлэх
        </Link>
      </div>
    </div>
  );
}
