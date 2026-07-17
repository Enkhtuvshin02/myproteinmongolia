"use client";

import { useEffect } from "react";
import { SearchSelect } from "./search-select";
import { getDistricts, getKhoroos } from "@/lib/mn-address";

// Shape used by the saved-address (profile page) feature only — distinct
// from the flat MN delivery fields now stored directly on Order.
export type SavedAddressInput = {
  label: string;
  city: string;
  district: string;
  khoroo: string;
  detail: string;
  otherRecipient: boolean;
};

const field = "h-11 w-full rounded-lg border border-border-subtle px-3 text-sm outline-none focus:border-brand bg-background";
const lbl = "mb-1 block text-sm font-medium";
const req = <span className="text-sale">*</span>;

export function AddressFields({
  value,
  onChange,
  labelSize = "default",
}: {
  value: SavedAddressInput;
  onChange: (a: SavedAddressInput) => void;
  labelSize?: "default" | "small";
}) {
  const lblClass = labelSize === "small" ? "mb-1 block text-xs font-medium text-muted-foreground" : lbl;

  const set = <K extends keyof SavedAddressInput>(key: K, val: SavedAddressInput[K]) =>
    onChange({ ...value, [key]: val });

  const districts = getDistricts();
  const khoroos = value.district ? getKhoroos(value.district) : [];

  // Auto-set city to Улаанбаатар
  useEffect(() => {
    if (value.city !== "Улаанбаатар") onChange({ ...value, city: "Улаанбаатар", district: "", khoroo: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset khoroo when district changes
  useEffect(() => {
    if (value.district) onChange({ ...value, khoroo: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.district]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className={lblClass}>Хаягийн нэр {req}</span>
          <input className={field} placeholder="Гэр, Ажил" value={value.label} onChange={(e) => set("label", e.target.value)} />
        </div>
        <div>
          <span className={lblClass}>Дүүрэг {req}</span>
          <SearchSelect
            value={value.district}
            onChange={(v) => set("district", v)}
            options={districts}
            placeholder="Дүүрэг сонгох"
          />
        </div>
        <div>
          <span className={lblClass}>Хороо</span>
          <SearchSelect
            value={value.khoroo}
            onChange={(v) => set("khoroo", v)}
            options={khoroos}
            placeholder={value.district ? "Хороо сонгох" : "Эхлээд дүүрэг сонгоно уу"}
            disabled={!value.district}
          />
        </div>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.otherRecipient}
          onChange={(e) => set("otherRecipient", e.target.checked)}
          className="size-4 accent-[var(--brand)]"
        />
        Өөр хүн хүлээн авна
      </label>

      <div>
        <span className={lblClass}>Дэлгэрэнгүй хаяг {req}</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-border-subtle bg-background p-3 text-sm outline-none focus:border-brand"
          placeholder="Байр, тоот, орц, давхар…"
          value={value.detail}
          onChange={(e) => set("detail", e.target.value)}
        />
      </div>
    </div>
  );
}
