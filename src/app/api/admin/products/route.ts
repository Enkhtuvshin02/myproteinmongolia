import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(1000, Math.max(1, Number(searchParams.get("pageSize")) || 30));

  const [data, total] = await Promise.all([
    db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        stock: true,
        isNew: true,
        isFeatured: true,
        isBundle: true,
        category: { select: { name: true } },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count(),
  ]);
  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, price, originalPrice, image, categorySlug, stock, isNew, isFeatured, isBundle, unit, brand, flavors, descriptionAccordions, nutritionTable, nutritionNotice } = body;

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
      brand: brand ?? null,
      descriptionAccordions: descriptionAccordions ?? undefined,
      nutritionTable: nutritionTable ?? undefined,
      nutritionNotice: nutritionNotice ?? null,
      flavors: Array.isArray(flavors) && flavors.length > 0
        ? { create: flavors.map((f: { flavorName: string; stock: number }) => ({ flavorName: f.flavorName, stock: Number(f.stock ?? 0) })) }
        : undefined,
    },
    include: { flavors: true },
  });
  return NextResponse.json(product, { status: 201 });
}
