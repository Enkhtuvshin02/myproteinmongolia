"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Spinner } from "@/components/ui/spinner";

type Product = {
  id: string;
  name: string;
  price: number;
};

type FormValues = {
  isActive: boolean;
  productId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  discountCode: string;
  discountValue: string;
  imageUrl: string;
};

export default function AdminPromotionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [values, setValues] = useState<FormValues>({
    isActive: false,
    productId: "",
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    discountCode: "",
    discountValue: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch products first
    fetch("/api/admin/products?pageSize=1000")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.data)) {
          setProducts(data.data);
        }
      })
      .catch(() => {});

    // Fetch existing settings
    fetch("/api/admin/promotion")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          const formatDate = (d: string) => (d ? d.substring(0, 10) : "");
          setValues({
            isActive: data.isActive ?? false,
            productId: data.productId ?? "",
            title: data.title ?? "",
            description: data.description ?? "",
            startDate: formatDate(data.startDate),
            endDate: formatDate(data.endDate),
            discountCode: data.discountCode ?? "",
            discountValue: data.discountValue ?? "",
            imageUrl: data.imageUrl ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (field: keyof FormValues, value: string | boolean) => {
    setValues((v) => ({ ...v, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!values.title || !values.description || !values.startDate || !values.endDate) {
      setError("Гарчиг, тайлбар, эхлэх болон дуусах хугацааг заавал оруулна уу.");
      setSaving(false);
      return;
    }

    // Set end date to local end of day: YYYY-MM-DDT23:59:59.999Z to make sure it covers the full day
    const parsedStartDate = new Date(`${values.startDate}T00:00:00`);
    const parsedEndDate = new Date(`${values.endDate}T23:59:59`);

    const res = await fetch("/api/admin/promotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isActive: values.isActive,
        productId: values.productId || null,
        title: values.title,
        description: values.description,
        startDate: parsedStartDate.toISOString(),
        endDate: parsedEndDate.toISOString(),
        discountCode: values.discountCode || null,
        discountValue: values.discountValue || null,
        imageUrl: values.imageUrl || null,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа.");
      return;
    }

    setSuccess("Амжилттай хадгалагдлаа!");
    router.refresh();
  };

  if (loading) {
    return <Spinner />;}

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Урамшуулал (Pop-up) тохиргоо</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Хэрэглэгчдийг сайтад орох үед харагдах сурталчилгааны поп-ап цонхны тохиргоо.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border-subtle bg-background p-6">
        {error && <p className="rounded-lg bg-sale/10 px-3 py-2 text-sm text-sale">{error}</p>}
        {success && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{success}</p>}

        {/* Toggle Active status */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle p-3 hover:bg-muted/30">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="size-4 rounded accent-brand"
          />
          <div>
            <span className="text-sm font-semibold block">Урамшуулал идэвхтэй эсэх</span>
            <span className="text-xs text-muted-foreground block">Идэвхжүүлснээр заасан хугацаанд поп-ап харагдах болно.</span>
          </div>
        </label>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Эхлэх хугацаа *">
            <input
              required
              type="date"
              value={values.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </Field>
          <Field label="Дуусах хугацаа *">
            <input
              required
              type="date"
              value={values.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </Field>
        </div>

        {/* Product selection */}
        <Field label="Холбох бүтээгдэхүүн (Сонголтоор)">
          <select
            value={values.productId}
            onChange={(e) => set("productId", e.target.value)}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink bg-background"
          >
            <option value="">-- Бүтээгдэхүүн холбохгүй --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (₮{p.price.toLocaleString()})
              </option>
            ))}
          </select>
        </Field>

        {/* Title and Description */}
        <Field label="Поп-ап гарчиг *">
          <input
            required
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Жишээ: Хүслээ цэнэглэ"
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </Field>

        <Field label="Дэлгэрэнгүй тайлбар *">
          <textarea
            required
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Жишээ: Эхний захиалгадаа 15% хямдрал аваарай! Шинэ хэрэглэгчдэд зориулсан онцгой урамшуулал."
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </Field>

        {/* Discount Details */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Хямдралын утга (Жишээ нь: 15% эсвэл 10,000₮)">
            <input
              value={values.discountValue}
              onChange={(e) => set("discountValue", e.target.value)}
              placeholder="Жишээ: 15%"
              className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </Field>
          <Field label="Урамшууллын код (Promo Code)">
            <input
              value={values.discountCode}
              onChange={(e) => set("discountCode", e.target.value)}
              placeholder="Жишээ: WELCOME15"
              className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </Field>
        </div>

        {/* Custom Image Banner */}
        <Field label="Сурталчилгааны зураг (Сонголтоор)">
          <div className="space-y-2">
            {values.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.imageUrl}
                alt="Promotion Banner Preview"
                className="h-32 w-full rounded-lg border border-border-subtle bg-muted object-contain"
              />
            )}
            <CldUploadWidget
              uploadPreset={undefined}
              signatureEndpoint="/api/admin/sign-upload"
              onSuccess={(result) => {
                const info = result.info as { secure_url: string };
                if (info?.secure_url) set("imageUrl", info.secure_url);
              }}
              options={{ maxFiles: 1, resourceType: "image", folder: "myprotein/promotions" }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full rounded-lg border-2 border-dashed border-border-subtle py-3 text-sm text-muted-foreground transition-colors hover:border-ink hover:text-foreground"
                >
                  {values.imageUrl ? "Зураг солих" : "Зураг оруулах (Хэрэв хоосон бол бүтээгдэхүүний зургийг ашиглана)"}
                </button>
              )}
            </CldUploadWidget>
            <input
              value={values.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
              placeholder="Эсвэл зургийн URL оруулах"
            />
          </div>
        </Field>

        {/* Save Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-ink px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-50"
          >
            {saving ? "Хадгалж байна..." : "Тохиргоог хадгалах"}
          </button>
        </div>
      </form>
    </div>
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
