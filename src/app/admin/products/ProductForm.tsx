"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Plus, Trash2 } from "lucide-react";
import { categories } from "@/lib/data";

type FlavorRow = { flavorName: string; stock: string };

type FormValues = {
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  categorySlug: string;
  stock: string;
  unit: string;
  isNew: boolean;
  isFeatured: boolean;
  isBundle: boolean;
  flavors: FlavorRow[];
};

type Props = {
  productId?: string;
  initial?: Partial<FormValues>;
};

const empty: FormValues = {
  name: "",
  price: "",
  originalPrice: "",
  image: "",
  categorySlug: categories[0].slug,
  stock: "0",
  unit: "",
  isNew: false,
  isFeatured: false,
  isBundle: false,
  flavors: [],
};

export default function ProductForm({ productId, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({ ...empty, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormValues, value: string | boolean | FlavorRow[]) =>
    setValues((v) => ({ ...v, [field]: value }));

  const setFlavor = (i: number, patch: Partial<FlavorRow>) =>
    setValues((v) => ({ ...v, flavors: v.flavors.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        price: values.price,
        originalPrice: values.originalPrice || null,
        image: values.image,
        categorySlug: values.categorySlug,
        stock: values.stock,
        unit: values.unit || null,
        isNew: values.isNew,
        isFeatured: values.isFeatured,
        isBundle: values.isBundle,
        flavors: values.flavors.filter((f) => f.flavorName.trim()).map((f) => ({ flavorName: f.flavorName.trim(), stock: f.stock || 0 })),
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-border-subtle bg-background p-6">
      {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}

      <Field label="Нэр *">
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          placeholder="Бүтээгдэхүүний нэр"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Үнэ (₮) *">
          <input
            required
            type="number"
            min="0"
            value={values.price}
            onChange={(e) => set("price", e.target.value)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            placeholder="185000"
          />
        </Field>
        <Field label="Хуучин үнэ (₮)">
          <input
            type="number"
            min="0"
            value={values.originalPrice}
            onChange={(e) => set("originalPrice", e.target.value)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            placeholder="Хоосон = хямдрал байхгүй"
          />
        </Field>
      </div>

      <Field label="Зураг *">
        <div className="space-y-2">
          {values.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.image}
              alt="preview"
              className="h-40 w-full rounded-lg border border-border-subtle bg-muted object-contain"
            />
          )}
          <CldUploadWidget
            uploadPreset={undefined}
            signatureEndpoint="/api/admin/sign-upload"
            onSuccess={(result) => {
              const info = result.info as { secure_url: string };
              if (info?.secure_url) set("image", info.secure_url);
            }}
            options={{ maxFiles: 1, resourceType: "image", folder: "gainhub/products" }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="w-full rounded-lg border-2 border-dashed border-border-subtle py-3 text-sm text-muted-foreground transition-colors hover:border-ink hover:text-foreground"
              >
                {values.image ? "Зураг солих" : "Зураг оруулах"}
              </button>
            )}
          </CldUploadWidget>
          <input
            value={values.image}
            onChange={(e) => set("image", e.target.value)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            placeholder="Эсвэл URL оруулах: /products/whey.svg"
          />
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Ангилал *">
          <select
            required
            value={values.categorySlug}
            onChange={(e) => set("categorySlug", e.target.value)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Нэгж">
          <input
            value={values.unit}
            onChange={(e) => set("unit", e.target.value)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            placeholder="2кг"
          />
        </Field>
      </div>

      <Field label="Нөөц">
        <input
          type="number"
          min="0"
          value={values.stock}
          onChange={(e) => set("stock", e.target.value)}
          className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </Field>

      <Field label="Амтууд (заавал биш)">
        <div className="space-y-2">
          {values.flavors.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={f.flavorName}
                onChange={(e) => setFlavor(i, { flavorName: e.target.value })}
                placeholder="Шоколад"
                className="flex-1 rounded-lg border border-border-subtle px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <input
                type="number"
                min="0"
                value={f.stock}
                onChange={(e) => setFlavor(i, { stock: e.target.value })}
                placeholder="Нөөц"
                className="w-24 rounded-lg border border-border-subtle px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
              />
              <button type="button" onClick={() => set("flavors", values.flavors.filter((_, idx) => idx !== i))} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-sale">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("flavors", [...values.flavors, { flavorName: "", stock: "0" }])}
            className="flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            <Plus className="size-4" /> Амт нэмэх
          </button>
        </div>
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={values.isNew} onChange={(e) => set("isNew", e.target.checked)} />
          Шинэ бүтээгдэхүүн
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={values.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
          Онцлох
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={values.isBundle} onChange={(e) => set("isBundle", e.target.checked)} />
          Иж бүрдэл (bundle)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-50"
        >
          {saving ? "Хадгалж байна..." : productId ? "Шинэчлэх" : "Үүсгэх"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Цуцлах
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
}
