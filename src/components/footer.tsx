"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";

const shopLinks = [
  { label: "Уураг", href: "/product?category=whey" },
  { label: "Креатин", href: "/product?category=creatine" },
  { label: "Дасгалын өмнөх", href: "/product?category=preworkout" },
  { label: "Иж бүрдэл", href: "/product?category=bundle" },
];

const helpLinks = [
  { label: "Үйлчилгээний нөхцөл", href: "/service" },
  { label: "Хүргэлт", href: "/delivery" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setJoined(true);
  };

  return (
    <footer className="mt-16 bg-shop-black text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo className="text-white" />
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/50">
            Өндөр гүйцэтгэлийн спорт нэмэлт тэжээл — техникийн нарийвчлал шаарддаг тамирчдад зориулав.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Дэлгүүр</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/70 hover:text-brand">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Тусламж</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/70 hover:text-brand">{l.label}</Link>
              </li>
            ))}
            <li>
              <a href="tel:77100100" className="flex items-center gap-1.5 text-white/70 hover:text-brand">
                <Phone className="size-3.5" /> 77100100
              </a>
            </li>
            <li>
              <a href="mailto:info@myproteinmongolia.mn" className="flex items-center gap-1.5 text-white/70 hover:text-brand">
                <Mail className="size-3.5" /> info@myproteinmongolia.mn
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Мэдээлэл авах</h3>
          {joined ? (
            <p className="mt-4 text-sm text-brand">Баярлалаа! Бүртгэгдлээ.</p>
          ) : (
            <form onSubmit={submit} className="mt-4 flex">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Имэйл"
                className="h-10 w-full min-w-0 border border-white/15 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand"
              />
              <button
                type="submit"
                className="shrink-0 bg-brand px-4 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-hover"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-4 py-4 text-center text-[11px] uppercase tracking-wide text-white/30">
          © 2026 MyProtein Mongolia. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
