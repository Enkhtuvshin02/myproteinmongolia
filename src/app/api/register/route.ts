import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken, COOKIE_NAME, authCookieOptions } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName, phone } = await req.json();

  if (!email || !password || !firstName) {
    return NextResponse.json({ error: "Мэдээлэл дутуу байна." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "Энэ и-мэйл хаягаар бүртгэл үүссэн байна." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashed,
      firstName: firstName.trim(),
      lastName: (lastName ?? "").trim(),
      phone: phone ?? null,
    },
  });

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
