import Link from "next/link";
import { Mail, Phone } from "lucide-react";

// Thin brand utility bar above the header (greeting left, info/contact right).
export function TopBar() {
  return (
    <div className="bg-brand text-xs text-brand-foreground">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-1.5">
        <p className="truncate">GainHub — уураг, креатин, спортын нэмэлт тэжээлийн дэлгүүрт тавтай морил!</p>
        <div className="hidden items-center gap-5 sm:flex">
          <Link href="/about" className="hover:underline">Бидний тухай</Link>
          <Link href="/contact" className="hover:underline">Тусламж</Link>
          <a href="tel:77100100" className="flex items-center gap-1.5 hover:underline">
            <Phone className="size-3.5" />
            77100100
          </a>
          <a href="mailto:info@gainhub.mn" className="flex items-center gap-1.5 hover:underline">
            <Mail className="size-3.5" />
            info@gainhub.mn
          </a>
        </div>
      </div>
    </div>
  );
}
