import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";
import { generateOrderId } from "@/lib/checkout";

function serializeOrder(o: Awaited<ReturnType<typeof fetchOrder>>) {
  return {
    id: o.id,
    createdAt: o.createdAt.getTime(),
    status: o.status,
    subtotal: o.subtotal,
    discount: o.discount,
    delivery: o.delivery,
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
        id: item.product.id,
        name: item.product.name,
        price: item.price,
        image: item.product.image,
        categorySlug: item.product.categorySlug,
        rating: item.product.rating,
        stock: item.product.stock,
        isNew: item.product.isNew,
        isFeatured: item.product.isFeatured,
        isBundle: item.product.isBundle,
        unit: item.product.unit ?? undefined,
        originalPrice: item.product.originalPrice ?? undefined,
      },
      qty: item.qty,
      flavor: item.flavor ?? undefined,
    })),
  };
}

async function fetchOrder(id: string, userId: string) {
  return db.order.findFirstOrThrow({
    where: { id, userId },
    include: { items: { include: { product: true } } },
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const orders = await db.order.findMany({
    where: { userId: session.sub },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });

  const body = await req.json();
  const {
    id: clientId, custFirstName, custLastName, phonePrimary, phoneSecondary, district, khoroo, detailedAddress,
    items, subtotal, discount, delivery, total,
  } = body;

  const id = typeof clientId === "string" && clientId ? clientId : generateOrderId();

  const order = await db.order.create({
    data: {
      id,
      userId: session.sub,
      custFirstName,
      custLastName,
      phonePrimary,
      phoneSecondary,
      district,
      khoroo,
      detailedAddress,
      subtotal,
      discount: discount ?? 0,
      delivery,
      total,
      status: "NEW",
      paymentMethod: "BANK_TRANSFER",
      items: {
        create: items.map((line: { product: { id: string; price: number }; qty: number; flavor?: string }) => ({
          productId: line.product.id,
          qty: line.qty,
          price: line.product.price,
          flavor: line.flavor ?? null,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  });

  return NextResponse.json(serializeOrder(order), { status: 201 });
}
