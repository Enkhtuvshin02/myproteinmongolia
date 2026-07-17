import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/checkout";
import { districtLabel } from "@/lib/mn-address";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { ReceiptThumbnail } from "./ReceiptThumbnail";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

const DATE_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ulaanbaatar",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function fmtDateTime(iso: string) {
  const parts = Object.fromEntries(DATE_FMT.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const validStatus = status && status in OrderStatus ? (status as OrderStatus) : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const where = validStatus ? { status: validStatus } : undefined;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        status: true,
        total: true,
        custFirstName: true,
        custLastName: true,
        phonePrimary: true,
        phoneSecondary: true,
        district: true,
        khoroo: true,
        detailedAddress: true,
        receiptImageUrl: true,
        items: { select: { qty: true, product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.order.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageQuery = (p: number) => `/admin/orders?${validStatus ? `status=${validStatus}&` : ""}page=${p}`;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-xl font-bold">Захиалга</h1>
        <div className="ml-4 flex gap-1.5">
          {(["", ...ORDER_STATUS_FLOW] as const).map((s) => (
            <Link
              key={s}
              href={s ? `/admin/orders?status=${s}` : "/admin/orders"}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                (status ?? "") === s ? "bg-ink text-white" : "bg-muted text-muted-foreground hover:bg-border-subtle"
              }`}
            >
              {s ? ORDER_STATUS_LABELS[s] : "Бүгд"}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium text-muted-foreground">Захиалга / Огноо</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Хэрэглэгч</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Утас</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Хаяг</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Дүн</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Баримт</th>
              <th className="px-3 py-2 font-medium text-muted-foreground">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border-subtle last:border-0 hover:bg-muted/40">
                <td className="px-3 py-2 align-top">
                  <div className="font-mono text-xs font-semibold">{o.id}</div>
                  <div className="text-xs text-muted-foreground">{fmtDateTime(o.createdAt.toISOString())}</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <div className="font-medium">{o.custLastName} {o.custFirstName}</div>
                  <div className="text-xs text-muted-foreground">{o.items.reduce((s, i) => s + i.qty, 0)} ш</div>
                </td>
                <td className="px-3 py-2 align-top">
                  <a href={`tel:${o.phonePrimary}`} className="block text-brand hover:underline">{o.phonePrimary}</a>
                  <a href={`tel:${o.phoneSecondary}`} className="block text-xs text-muted-foreground hover:underline">{o.phoneSecondary}</a>
                </td>
                <td className="max-w-[220px] px-3 py-2 align-top text-xs text-muted-foreground">
                  {districtLabel(o.district)}, {o.khoroo}, {o.detailedAddress}
                </td>
                <td className="px-3 py-2 align-top font-semibold">₮{o.total.toLocaleString()}</td>
                <td className="px-3 py-2 align-top">
                  {o.receiptImageUrl ? (
                    <ReceiptThumbnail url={o.receiptImageUrl} />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 align-top">
                  <OrderStatusSelect id={o.id} status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Захиалга олдсонгүй.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <Link
            href={pageQuery(page - 1)}
            aria-disabled={page <= 1}
            className={`rounded px-3 py-1.5 ${page <= 1 ? "pointer-events-none text-muted-foreground/40" : "text-foreground hover:bg-muted"}`}
          >
            ← Өмнөх
          </Link>
          <span className="text-muted-foreground">{page} / {totalPages}</span>
          <Link
            href={pageQuery(page + 1)}
            aria-disabled={page >= totalPages}
            className={`rounded px-3 py-1.5 ${page >= totalPages ? "pointer-events-none text-muted-foreground/40" : "text-foreground hover:bg-muted"}`}
          >
            Дараах →
          </Link>
        </div>
      )}
    </div>
  );
}
