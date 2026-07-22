import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import {
  hasSystemAccess,
  systemIdFromPath,
  type AdminSystemId,
} from "@/lib/admin-systems";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/auth-session";

/** Only allow post-login paths the user may open. */
function resolveDestination(
  callbackUrl: string | undefined,
  allowedSystems: AdminSystemId[]
) {
  if (!callbackUrl?.startsWith("/")) {
    return "/applications";
  }

  const system = systemIdFromPath(callbackUrl);
  if (system && !hasSystemAccess(allowedSystems, system)) {
    return "/applications";
  }

  return callbackUrl;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username ?? body.email)?.toString().trim();
    const password = body.password?.toString();
    const callbackUrl = body.callbackUrl?.toString();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    if (user.allowedSystems.length === 0) {
      return NextResponse.json(
        { error: "Your account has no application access" },
        { status: 403 }
      );
    }

    const token = await signSessionToken(user);
    const destination = resolveDestination(callbackUrl, user.allowedSystems);
    const response = NextResponse.json({
      user: {
        username: user.email,
        name: user.name,
        role: user.role,
        allowedSystems: user.allowedSystems,
      },
      destination,
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(undefined, request));
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
