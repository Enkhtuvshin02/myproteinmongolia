import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-utils";

const PROTECTED = ["/orders", "/profile", "/checkout"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname.startsWith("/admin");
  const isProtected = isAdmin || PROTECTED.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("gainhub-token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifyToken(token);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && !session.isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orders/:path*", "/profile/:path*", "/checkout/:path*", "/admin/:path*"],
};
