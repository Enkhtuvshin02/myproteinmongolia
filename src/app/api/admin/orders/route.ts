import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const validStatus = status && status in OrderStatus ? (status as OrderStatus) : undefined;

  const orders = await db.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    include: {
      items: { include: { product: { select: { name: true } } } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
