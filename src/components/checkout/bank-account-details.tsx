"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatPrice } from "@/lib/data";
import { BANK_ACCOUNTS } from "@/lib/checkout";

// Static, always-visible bank-transfer details — shared by the one-page
// checkout (inline) and the order-detail "pay now" reminder (inside a modal).
export function BankAccountDetails({ amount, orderId }: { amount: number; orderId?: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (v: string) => {
    navigator.clipboard?.writeText(v).catch(() => {});
    setCopied(v);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      {BANK_ACCOUNTS.map((b) => {
        const rows = [
          { label: "Банк", value: b.bank },
          { label: "Данс", value: b.account },
          { label: "Хүлээн авагч", value: b.name },
        ];
        return (
          <div key={b.bank} className="rounded-card border border-border-subtle p-4">
            <p className="mb-3 text-sm font-semibold">{b.bank}</p>
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.label} className="rounded-md bg-muted/60 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{r.label}</p>
                      <p className="text-sm font-semibold">{r.value}</p>
                    </div>
                    <button type="button" onClick={() => copy(r.value)} aria-label="Хуулах" className="rounded-md p-1.5 hover:bg-background">
                      {copied === r.value ? <Check className="size-4 text-success" /> : <Copy className="size-4 text-muted-foreground" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      <div className="rounded-md bg-muted/60 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Нийт төлөх дүн</span>
          <span className="text-lg font-bold">{formatPrice(amount)}</span>
        </div>
        {orderId && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Гүйлгээний утга</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold">{orderId}</span>
              <button type="button" onClick={() => copy(orderId)} className="rounded p-1 hover:bg-background">
                {copied === orderId ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Гүйлгээний утга дээр захиалгын дугаарыг бичнэ үү.
      </p>
    </div>
  );
}
