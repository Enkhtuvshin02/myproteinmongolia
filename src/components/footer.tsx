"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";

const helpLinks = [
  { label: "Үйлчилгээний нөхцөл", href: "/service" },
  { label: "Хүргэлт", href: "/delivery" },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-shop-black text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-3">
        <div className="max-w-xs">
          <Logo className="text-white" />
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Английн алдарт Myprotein брэндийн спорт нэмэлт тэжээл, уургийг Монгол дахь хэрэглэгчиддээ түргэн шуурхай хүргэж байна.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Тусламж</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/70 hover:text-brand">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">Холбоо барих</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
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
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-white/30 tracking-wide uppercase">
          <div>© 2026 MyProtein Mongolia. Бүх эрх хуулиар хамгаалагдсан.</div>
          <div className="normal-case text-[10px] text-white/20">
            Myprotein® брэндийн Монгол дахь албан ёсны борлуулагч — <a href="https://www.myprotein.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand underline transition-colors">www.myprotein.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
