"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Landmark, MapPin, User } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { useAccount } from "@/components/account-context";
import { useOrders } from "@/components/orders-context";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { OrderSummary } from "@/components/checkout/order-summary";
import { BankAccountDetails } from "@/components/checkout/bank-account-details";
import { DISTRICT_OPTIONS } from "@/lib/mn-address";
import { computeTotals, type OrderDraft } from "@/lib/checkout";

const field = "h-12 w-full rounded-lg border border-border-subtle bg-background px-3 text-base outline-none focus:border-brand";
const lbl = "mb-1.5 block text-sm font-medium";
const req = <span className="text-sale">*</span>;

const BLANK: OrderDraft = {
  custFirstName: "", custLastName: "", phonePrimary: "", phoneSecondary: "",
  district: "", khoroo: "", detailedAddress: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, clear } = useCart();
  const { user } = useAccount();
  const { placeOrder } = useOrders();

  const [form, setForm] = useState<OrderDraft>(BLANK);
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

  const valid =
    form.custFirstName.trim() && form.phonePrimary.trim() && form.phoneSecondary.trim() &&
    form.district && form.khoroo.trim() && form.detailedAddress.trim();

  const { delivery, ecoBag, total: grandTotal } = computeTotals(total);

  const confirmOrder = async () => {
    if (!valid || placing) return;
    setPlacing(true);
    setError("");
    try {
      const order = await placeOrder({ ...form, items: lines, subtotal: total, discount: 0, delivery, ecoBag, total: grandTotal });
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

      <div className="space-y-5">
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
        </section>

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
        </section>

        <section className="rounded-card border border-border-subtle p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Landmark className="size-5 text-brand" /> Банкны шилжүүлэг
          </h2>
          <BankAccountDetails amount={grandTotal} />
        </section>

        <OrderSummary
          lines={lines}
          subtotal={total}
          showFees
          cta={{ label: placing ? "Хадгалж байна…" : "Захиалга баталгаажуулах", onClick: confirmOrder, disabled: !valid || placing }}
          secondary={{ label: "Сагс руу буцах", href: "/cart" }}
        />
        {error && <p className="text-center text-sm text-sale">{error}</p>}
      </div>
    </div>
  );
}
