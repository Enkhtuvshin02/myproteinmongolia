import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null);
  return NextResponse.json({
    id: session.sub,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    phone: session.phone,
    isAdmin: session.isAdmin,
  });
}
