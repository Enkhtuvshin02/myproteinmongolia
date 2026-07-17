"use client";

import Link from "next/link";
import Image from "next/image";
import type { CartLine } from "@/components/cart-context";
import { formatPrice } from "@/lib/data";
import { computeTotals } from "@/lib/checkout";

type Cta = { label: string; href?: string; onClick?: () => void; disabled?: boolean };

export function OrderSummary({
  lines,
  subtotal,
  discount = 0,
  showFees = false,
  cta,
  secondary,
}: {
  lines?: CartLine[];
  subtotal: number;
  discount?: number;
  showFees?: boolean;
  cta?: Cta;
  secondary?: { label: string; href?: string; onClick?: () => void };
}) {
  const { delivery, total } = computeTotals(subtotal, discount);
  const grandTotal = showFees ? total : Math.max(0, subtotal - discount);

  return (
    <div className="rounded-card border border-border-subtle bg-background p-5">
      <h2 className="mb-4 text-lg font-bold">Төлбөрийн мэдээлэл</h2>

      {lines && lines.length > 0 && (
        <ul className="mb-4 space-y-3 border-b border-border-subtle pb-4">
          {lines.map(({ product, qty, flavor }) => (
            <li key={flavor ? `${product.id}::${flavor}` : product.id} className="flex items-center gap-3 text-sm">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={product.image} alt={product.name} fill sizes="40px" className="object-cover" />
              </div>
              <span className="flex-1">
                <span className="line-clamp-1 block">{product.name}</span>
                {flavor && <span className="block text-xs text-muted-foreground">Амт: {flavor}</span>}
              </span>
              <span className="text-muted-foreground">x{qty}</span>
              <span className="font-medium">{formatPrice(product.price * qty)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Бүтээгдэхүүний үнэ</dt>
          <dd className="font-medium">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sale">
            <dt>Хөнгөлөлт</dt>
            <dd>-{formatPrice(discount)}</dd>
          </div>
        )}
        {showFees && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Дотоодын хүргэлт</dt>
            <dd className="font-medium">{formatPrice(delivery)}</dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
        <span className="font-semibold">Нийт төлөх дүн</span>
        <span className="text-xl font-bold">{formatPrice(grandTotal)}</span>
      </div>

      {cta &&
        (cta.href ? (
          <Link
            href={cta.href}
            className={`mt-5 block w-full rounded-lg py-3 text-center font-semibold text-brand-foreground transition-colors ${
              cta.disabled ? "pointer-events-none bg-muted text-muted-foreground" : "bg-brand hover:bg-brand-hover"
            }`}
          >
            {cta.label}
          </Link>
        ) : (
          <button
            onClick={cta.onClick}
            disabled={cta.disabled}
            className="mt-5 block w-full rounded-lg bg-brand py-3 text-center font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:bg-muted disabled:text-muted-foreground"
          >
            {cta.label}
          </button>
        ))}

      {secondary &&
        (secondary.href ? (
          <Link href={secondary.href} className="mt-2 block w-full rounded-lg border border-border-subtle py-2.5 text-center text-sm font-medium hover:bg-muted">
            {secondary.label}
          </Link>
        ) : (
          <button onClick={secondary.onClick} className="mt-2 block w-full rounded-lg border border-border-subtle py-2.5 text-center text-sm font-medium hover:bg-muted">
            {secondary.label}
          </button>
        ))}
    </div>
  );
}
