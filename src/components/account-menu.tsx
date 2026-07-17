"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Package, User as UserIcon } from "lucide-react";
import { useAccount } from "./account-context";

export function AccountMenu() {
  const { user, signOut } = useAccount();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Local mount flag: guaranteed false on the first client render, so the
  // initial markup matches the server and avoids a hydration mismatch.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Render the signed-out shape until mounted to avoid SSR/localStorage mismatch.
  if (!mounted || !user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        <UserIcon className="size-5" />
        <span className="hidden sm:inline">Нэвтрэх</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg py-1.5 px-2 hover:bg-muted"
      >
        <UserIcon className="size-5 text-brand" />
        <span className="hidden text-left text-xs leading-tight sm:block">
          <span className="block max-w-[120px] truncate font-semibold">
            {user.firstName} {user.lastName}
          </span>
          <span className="block max-w-[120px] truncate text-muted-foreground">
            {user.email}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-xl border border-border-subtle bg-background py-1 shadow-xl">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted"
          >
            <UserIcon className="size-4 text-muted-foreground" /> Хувийн мэдээлэл
          </Link>
          <Link
            href="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted"
          >
            <Package className="size-4 text-muted-foreground" /> Миний захиалгууд
          </Link>
          <div className="my-1 border-t border-border-subtle" />
          <button
            onClick={async () => {
              await signOut();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-sale hover:bg-muted"
          >
            <LogOut className="size-4" /> Гарах
          </button>
        </div>
      )}
    </div>
  );
}
