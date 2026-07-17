import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { name, price, originalPrice, image, categorySlug, stock, isNew, isFeatured, isBundle, unit, flavors } = body;

  if (Array.isArray(flavors)) {
    // Simplest correct approach for the admin form: replace all flavor rows wholesale.
    await db.productFlavor.deleteMany({ where: { productId: id } });
    if (flavors.length > 0) {
      await db.productFlavor.createMany({
        data: flavors.map((f: { flavorName: string; stock: number }) => ({ productId: id, flavorName: f.flavorName, stock: Number(f.stock ?? 0) })),
      });
    }
  }

  const product = await db.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(originalPrice !== undefined && { originalPrice: originalPrice ? Number(originalPrice) : null }),
      ...(image !== undefined && { image }),
      ...(categorySlug !== undefined && { categorySlug }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(isNew !== undefined && { isNew: Boolean(isNew) }),
      ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      ...(isBundle !== undefined && { isBundle: Boolean(isBundle) }),
      ...(unit !== undefined && { unit: unit || null }),
    },
    include: { flavors: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
