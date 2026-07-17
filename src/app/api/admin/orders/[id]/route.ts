import { NextRequest, NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  if (!(status in OrderStatus)) {
    return NextResponse.json({ error: "Буруу статус." }, { status: 400 });
  }

  const order = await db.order.update({ where: { id }, data: { status } });
  return NextResponse.json(order);
}
