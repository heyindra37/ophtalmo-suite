import { NextRequest, NextResponse } from "next/server";
import { isValidSessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;

  if (await isValidSessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};
