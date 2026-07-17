import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME, authCookieOptions } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await db.user.findUnique({ where: { email: email?.toLowerCase()?.trim() } });
  if (!user) {
    return NextResponse.json({ error: "Бүртгэлтэй и-мэйл олдсонгүй." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Нууц үг буруу байна." }, { status: 401 });
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    isAdmin: user.isAdmin,
  });

  const response = NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
  response.cookies.set(COOKIE_NAME, token, authCookieOptions());
  return response;
}
