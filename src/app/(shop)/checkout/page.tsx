"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Landmark, MapPin, User } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useAccount } from "@/components/account-context";
import { useOrders } from "@/components/orders-context";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { OrderSummary } from "@/components/checkout/order-summary";
import { BankAccountDetails } from "@/components/checkout/bank-account-details";
import { DISTRICT_OPTIONS } from "@/lib/mn-address";
import { computeTotals, generateOrderId, type OrderDraft } from "@/lib/checkout";

const field = "h-12 w-full rounded-lg border border-border-subtle bg-background px-3 text-base outline-none focus:border-brand";
const lbl = "mb-1.5 block text-sm font-medium";
const req = <span className="text-sale">*</span>;
const nextBtn = "mt-5 w-full rounded-lg bg-brand py-3 text-center font-semibold text-brand-foreground transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground";
const backBtn = "mt-5 rounded-lg border border-border-subtle px-5 py-3 font-medium transition-colors hover:bg-muted";

const BLANK: OrderDraft = {
  custFirstName: "", custLastName: "", phonePrimary: "", phoneSecondary: "",
  district: "", khoroo: "", detailedAddress: "",
};

const WIZARD_STEPS = [
  { icon: User, label: "Мэдээлэл" },
  { icon: MapPin, label: "Хаяг" },
  { icon: Landmark, label: "Төлбөр" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, clear } = useCart();
  const { user } = useAccount();
  const { placeOrder } = useOrders();

  const [form, setForm] = useState<OrderDraft>(BLANK);
  const [orderId] = useState(() => generateOrderId());
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    // Skip while an order is being placed: clear() empties the cart right
    // before we navigate to the confirmation page, which would otherwise
    // race this guard and bounce the user back to /cart.
    if (mounted && lines.length === 0 && !placing) router.replace("/cart");
  }, [mounted, lines.length, placing, router]);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, custFirstName: user.firstName, custLastName: user.lastName, phonePrimary: user.phone ?? "" }));
  }, [user]);

  const set = <K extends keyof OrderDraft>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const step1Valid = !!(form.custFirstName.trim() && form.phonePrimary.trim() && form.phoneSecondary.trim());
  const step2Valid = !!(form.district && form.khoroo.trim() && form.detailedAddress.trim());
  const valid = step1Valid && step2Valid;
  const reachable = (n: number) => n <= step || (n === 2 && step1Valid) || (n === 3 && valid);

  const { delivery, total: grandTotal } = computeTotals(total);

  const confirmOrder = async () => {
    if (!valid || placing) return;
    setPlacing(true);
    setError("");
    try {
      const order = await placeOrder({ id: orderId, ...form, items: lines, subtotal: total, discount: 0, delivery, total: grandTotal });
      clear();
      router.push(`/orders/${order.id}`);
    } catch {
      setError("Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[720px] px-4 py-6">
      <CheckoutSteps active={1} />

      <div className="mb-6 flex items-center">
        {WIZARD_STEPS.map((s, i) => {
          const n = i + 1;
          const done = n < step;
          const canGo = reachable(n);
          return (
            <div key={s.label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => canGo && setStep(n)}
                disabled={!canGo}
                className={`flex items-center gap-2 ${canGo ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    n === step ? "bg-brand text-brand-foreground" : done ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-4" /> : n}
                </span>
                <span className={`hidden text-sm font-medium sm:inline ${n === step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s.label}
                </span>
              </button>
              {n < WIZARD_STEPS.length && <span className="mx-3 h-px flex-1 bg-border-subtle" />}
            </div>
          );
        })}
      </div>

      <div className="space-y-5">
        {step === 1 && (
          <section className="rounded-card border border-border-subtle p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <User className="size-5 text-brand" /> Захиалагчийн мэдээлэл
            </h2>
            <div className="space-y-4">
              <div>
                <span className={lbl}>Нэр {req}</span>
                <input className={field} value={form.custFirstName} onChange={set("custFirstName")} />
              </div>
              <div>
                <span className={lbl}>Овог</span>
                <input className={field} value={form.custLastName} onChange={set("custLastName")} />
              </div>
              <div>
                <span className={lbl}>Утасны дугаар {req}</span>
                <input className={field} inputMode="tel" value={form.phonePrimary} onChange={set("phonePrimary")} />
              </div>
              <div>
                <span className={lbl}>Нэмэлт утасны дугаар {req}</span>
                <input className={field} inputMode="tel" value={form.phoneSecondary} onChange={set("phoneSecondary")} />
              </div>
            </div>
            <button type="button" className={nextBtn} disabled={!step1Valid} onClick={() => step1Valid && setStep(2)}>
              Үргэлжлүүлэх
            </button>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-card border border-border-subtle p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MapPin className="size-5 text-brand" /> Хүргэлтийн хаяг
            </h2>
            <div className="space-y-4">
              <div>
                <span className={lbl}>Дүүрэг {req}</span>
                <select className={field} value={form.district} onChange={set("district")}>
                  <option value="">Дүүрэг сонгох</option>
                  {DISTRICT_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className={lbl}>Хороо {req}</span>
                <input className={field} placeholder="18-р хороо" value={form.khoroo} onChange={set("khoroo")} />
              </div>
              <div>
                <span className={lbl}>Дэлгэрэнгүй хаяг {req}</span>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-border-subtle bg-background p-3 text-base outline-none focus:border-brand"
                  placeholder="Байр, орц, орцны код, хаалганы дугаар…"
                  value={form.detailedAddress}
                  onChange={set("detailedAddress")}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className={backBtn} onClick={() => setStep(1)}>
                Буцах
              </button>
              <button type="button" className={`${nextBtn} flex-1`} disabled={!step2Valid} onClick={() => step2Valid && setStep(3)}>
                Үргэлжлүүлэх
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <>
            <section className="rounded-card border border-border-subtle p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <Landmark className="size-5 text-brand" /> Банкны шилжүүлэг
              </h2>
              <BankAccountDetails amount={grandTotal} orderId={orderId} />
            </section>

            <OrderSummary
              lines={lines}
              subtotal={total}
              showFees
              cta={{ label: placing ? "Хадгалж байна…" : "Захиалга баталгаажуулах", onClick: confirmOrder, disabled: !valid || placing }}
              secondary={{ label: "Буцах", onClick: () => setStep(2) }}
            />
            {error && <p className="text-center text-sm text-sale">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
