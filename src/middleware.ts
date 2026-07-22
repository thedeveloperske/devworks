import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth-session";
import { resolveAppUrl } from "@/lib/app-url";
import { hasSystemAccess, systemIdFromPath } from "@/lib/admin-systems";

const PUBLIC_PATHS = new Set(["/login"]);

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo-") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/api/auth/login" || pathname === "/api/auth/logout") {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get("promed_session")?.value);

  if (PUBLIC_PATHS.has(pathname)) {
    if (session) {
      return NextResponse.redirect(resolveAppUrl("/applications", request));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = resolveAppUrl("/login", request);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const system = systemIdFromPath(pathname);
  if (system && !hasSystemAccess(session.allowedSystems, system)) {
    return NextResponse.redirect(resolveAppUrl("/applications", request));
  }

  if (pathname === "/" || pathname === "/admin") {
    return NextResponse.redirect(resolveAppUrl("/applications", request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
