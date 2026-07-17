import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await db.savedAddress.findFirst({ where: { id, userId: session.sub } });
  if (!existing) return NextResponse.json({ error: "Олдсонгүй." }, { status: 404 });

  if (body.isDefault) {
    await db.savedAddress.updateMany({
      where: { userId: session.sub },
      data: { isDefault: false },
    });
  }

  const updated = await db.savedAddress.update({
    where: { id },
    data: {
      label: body.label ?? existing.label,
      city: body.city ?? existing.city,
      district: body.district ?? existing.district,
      khoroo: body.khoroo ?? existing.khoroo,
      detail: body.detail ?? existing.detail,
      isDefault: body.isDefault ?? existing.isDefault,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });

  const { id } = await params;
  const existing = await db.savedAddress.findFirst({ where: { id, userId: session.sub } });
  if (!existing) return NextResponse.json({ error: "Олдсонгүй." }, { status: 404 });

  await db.savedAddress.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
