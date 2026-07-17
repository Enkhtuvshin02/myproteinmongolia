"use client";

import { Landmark, X } from "lucide-react";
import { BankAccountDetails } from "./bank-account-details";

export function BankTransferModal({
  amount,
  orderId,
  onClose,
}: {
  amount: number;
  orderId?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-card bg-background" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-border-subtle px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <Landmark className="size-5 text-brand" /> Банкны шилжүүлэг
          </h3>
          <button onClick={onClose} aria-label="Хаах" className="rounded-full p-1 hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <BankAccountDetails amount={amount} orderId={orderId} />
        </div>

        <div className="flex shrink-0 gap-3 border-t border-border-subtle px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-foreground hover:bg-brand-hover">
            Ойлголоо
          </button>
        </div>
      </div>
    </div>
  );
}
