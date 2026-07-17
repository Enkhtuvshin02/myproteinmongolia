import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";

function serializeOrder(o: {
  id: string; createdAt: Date; status: string; subtotal: number; discount: number;
  delivery: number; ecoBag: number; total: number; paymentMethod: string; receiptImageUrl: string | null;
  custFirstName: string; custLastName: string; phonePrimary: string; phoneSecondary: string;
  district: string; khoroo: string; detailedAddress: string;
  items: {
    product: { id: string; name: string; image: string; categorySlug: string; rating: number; stock: number;
      isNew: boolean; isFeatured: boolean; isBundle: boolean; unit: string | null; originalPrice: number | null };
    qty: number; price: number; flavor: string | null;
  }[];
}) {
  return {
    id: o.id,
    createdAt: o.createdAt.getTime(),
    status: o.status,
    subtotal: o.subtotal,
    discount: o.discount,
    delivery: o.delivery,
    ecoBag: o.ecoBag,
    total: o.total,
    paymentMethod: o.paymentMethod,
    receiptImageUrl: o.receiptImageUrl ?? undefined,
    custFirstName: o.custFirstName,
    custLastName: o.custLastName,
    phonePrimary: o.phonePrimary,
    phoneSecondary: o.phoneSecondary,
    district: o.district,
    khoroo: o.khoroo,
    detailedAddress: o.detailedAddress,
    items: o.items.map((item) => ({
      product: {
        id: item.product.id, name: item.product.name, price: item.price,
        image: item.product.image, categorySlug: item.product.categorySlug,
        rating: item.product.rating, stock: item.product.stock,
        isNew: item.product.isNew, isFeatured: item.product.isFeatured, isBundle: item.product.isBundle,
        unit: item.product.unit ?? undefined,
        originalPrice: item.product.originalPrice ?? undefined,
      },
      qty: item.qty,
      flavor: item.flavor ?? undefined,
    })),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });
  const { id } = await params;
  const order = await db.order.findFirst({
    where: { id, userId: session.sub },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(serializeOrder(order));
}

// Customer-facing PATCH: only lets the order's owner attach a bank-transfer
// receipt screenshot. Status changes are admin-only (see /api/admin/orders/[id]).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 401 });
  const { id } = await params;
  const { receiptImageUrl } = await req.json();

  if (typeof receiptImageUrl !== "string") {
    return NextResponse.json({ error: "Invalid receiptImageUrl" }, { status: 400 });
  }

  const existing = await db.order.findFirst({ where: { id, userId: session.sub } });
  if (!existing) return NextResponse.json(null, { status: 404 });

  const updated = await db.order.update({
    where: { id },
    data: { receiptImageUrl },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(serializeOrder(updated));
}
