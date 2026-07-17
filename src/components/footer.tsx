import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";

// Minimal footer — account actions live in the header, not here.
const legalLinks = [
  { label: "Үйлчилгээний нөхцөл", href: "/service" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border-subtle bg-muted/40">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {legalLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
          <a href="tel:77100100" className="flex items-center gap-1.5 hover:text-brand">
            <Phone className="size-4" /> 77100100
          </a>
          <a href="mailto:info@gainhub.mn" className="flex items-center gap-1.5 hover:text-brand">
            <Mail className="size-4" /> info@gainhub.mn
          </a>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto max-w-[1280px] px-4 py-3 text-center text-xs text-muted-foreground">
          © 2026 GainHub. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
