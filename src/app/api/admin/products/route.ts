import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await db.product.findMany({
    include: { category: true, flavors: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, price, originalPrice, image, categorySlug, stock, isNew, isFeatured, isBundle, unit, flavors } = body;

  if (!name || !price || !image || !categorySlug) {
    return NextResponse.json({ error: "Заавал бөглөх талбарууд дутуу байна." }, { status: 400 });
  }

  const id = "p" + Math.floor(100000000 + Math.random() * 900000000).toString();
  const product = await db.product.create({
    data: {
      id,
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      image,
      categorySlug,
      stock: Number(stock ?? 0),
      isNew: Boolean(isNew),
      isFeatured: Boolean(isFeatured),
      isBundle: Boolean(isBundle),
      unit: unit ?? null,
      flavors: Array.isArray(flavors) && flavors.length > 0
        ? { create: flavors.map((f: { flavorName: string; stock: number }) => ({ flavorName: f.flavorName, stock: Number(f.stock ?? 0) })) }
        : undefined,
    },
    include: { flavors: true },
  });
  return NextResponse.json(product, { status: 201 });
}
