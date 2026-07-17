"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { CheckCircle2, Landmark, Package, Truck, XCircle } from "lucide-react";
import { useOrders } from "@/components/orders-context";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { BankAccountDetails } from "@/components/checkout/bank-account-details";
import { formatPrice } from "@/lib/data";
import { districtLabel } from "@/lib/mn-address";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/checkout";

function fmtDate(ts: number) {
  const d = new Date(ts);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const STATUS_ICON: Record<OrderStatus, React.ReactNode> = {
  NEW: <Landmark className="size-12 text-rating" />,
  PAID: <CheckCircle2 className="size-12 text-success" />,
  ON_THE_WAY: <Truck className="size-12 text-brand" />,
  COMPLETED: <CheckCircle2 className="size-12 text-success" />,
  CANCELED: <XCircle className="size-12 text-sale" />,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder, hydrated, refreshOrders, attachReceipt } = useOrders();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (hydrated && !getOrder(id)) {
      // Try refreshing once (order may have just been created)
      refreshOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const order = getOrder(id);

  if (!hydrated) {
    return <div className="mx-auto max-w-[1000px] px-4 py-16 text-center text-muted-foreground">Уншиж байна…</div>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-[1000px] px-4 py-20 text-center">
        <p className="mb-4 text-lg font-medium">Захиалга олдсонгүй</p>
        <Link href="/orders" className="text-brand hover:underline">Миний захиалгууд руу буцах</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6">
      <CheckoutSteps active={3} />

      {/* status card */}
      <div className="mb-4 rounded-card border border-border-subtle p-6">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          {STATUS_ICON[order.status]}
          <p className="text-xl font-bold">{ORDER_STATUS_LABELS[order.status]}</p>
          {order.status === "NEW" && (
            <p className="text-sm text-muted-foreground">Доор дурдсан дансанд шилжүүлэг хийж, баримтын зурган хуулбарыг хавсаргана уу.</p>
          )}
          {order.status === "CANCELED" && (
            <Link href="/product" className="mt-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground hover:bg-brand-hover">
              Дэлгүүр хэсэх
            </Link>
          )}
        </div>
      </div>

      {/* bank transfer + receipt upload */}
      {order.status === "NEW" && (
        <div className="mb-4 rounded-card border border-border-subtle p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Landmark className="size-5 text-brand" /> Банкны шилжүүлэг
          </h2>
          <BankAccountDetails amount={order.total} orderId={order.id} />

          <div className="mt-5 border-t border-border-subtle pt-5">
            <h3 className="mb-2 text-sm font-semibold">Гүйлгээний баримт хавсаргах</h3>
            {order.receiptImageUrl ? (
              <div className="flex items-center gap-3">
                <div className="relative size-20 overflow-hidden rounded-lg border border-border-subtle">
                  <Image src={order.receiptImageUrl} alt="Баримт" fill sizes="80px" className="object-cover" />
                </div>
                <p className="text-sm text-success">Баримт амжилттай хавсаргагдлаа. Бид удахгүй шалгаж баталгаажуулна.</p>
              </div>
            ) : (
              <CldUploadWidget
                uploadPreset={undefined}
                signatureEndpoint="/api/sign-upload"
                onSuccess={(result) => {
                  const info = result.info as { secure_url: string };
                  if (info?.secure_url) {
                    setUploading(true);
                    attachReceipt(order.id, info.secure_url).finally(() => setUploading(false));
                  }
                }}
                options={{ maxFiles: 1, resourceType: "image", folder: "myprotein/receipts" }}
              >
                {({ open }) => (
                  <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border-subtle py-6 text-sm text-muted-foreground hover:border-brand hover:text-brand">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onClick={(e) => { e.preventDefault(); open(); }}
                      disabled={uploading}
                    />
                    {uploading ? "Хуулж байна…" : "Гүйлгээний баримтын зураг оруулах"}
                  </label>
                )}
              </CldUploadWidget>
            )}
          </div>
        </div>
      )}

      {/* delivery details */}
      <div className="mb-4 rounded-card border border-border-subtle p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Захиалгын дугаар</p>
            <p className="font-bold">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Захиалга хийсэн огноо</p>
            <p className="font-medium">{fmtDate(order.createdAt)}</p>
          </div>
        </div>
        <dl className="space-y-1.5 border-t border-border-subtle pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Хүлээн авагч</dt><dd>{order.custFirstName} {order.custLastName}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Утас</dt><dd>{order.phonePrimary} / {order.phoneSecondary}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Хаяг</dt><dd className="text-right">{districtLabel(order.district)}, {order.khoroo}, {order.detailedAddress}</dd></div>
        </dl>
        <dl className="mt-3 space-y-1.5 border-t border-border-subtle pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Бараа дүн</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-sale"><dt>Хөнгөлөлт</dt><dd>-{formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted-foreground">Дотоодын хүргэлт</dt><dd>{formatPrice(order.delivery)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Баглаа боодол</dt><dd>{formatPrice(order.ecoBag)}</dd></div>
          <div className="flex justify-between border-t border-border-subtle pt-2 text-base font-bold"><dt>Нийт төлөх дүн</dt><dd>{formatPrice(order.total)}</dd></div>
        </dl>
      </div>

      {/* items */}
      <div className="overflow-hidden rounded-card border border-border-subtle">
        <div className="flex items-center gap-2 border-b border-border-subtle bg-muted/40 px-4 py-3">
          <Package className="size-5 text-brand" />
          <div>
            <p className="text-sm font-semibold">MyProtein Mongolia хүргэлт</p>
            <p className="text-xs text-muted-foreground">24-48 цагийн хооронд хүргэгдэнэ.</p>
          </div>
        </div>
        <ul>
          {order.items.map(({ product, qty, flavor }, i) => (
            <li key={`${product.id}-${i}`} className="flex items-center gap-3 border-b border-border-subtle p-4 last:border-0">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={product.image} alt={product.name} fill sizes="56px" className="object-cover" />
              </div>
              <span className="line-clamp-2 flex-1 text-sm">
                {product.name}
                {flavor && <span className="block text-xs text-muted-foreground">Амт: {flavor}</span>}
              </span>
              <span className="text-sm text-muted-foreground">x{qty}</span>
              <span className="w-28 text-right text-sm font-semibold">{formatPrice(product.price * qty)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
