import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import { resolveAppUrl } from "@/lib/app-url";
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

function isFormRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}

function loginRedirect(request: Request, callbackUrl: string | undefined, error: string) {
  const url = resolveAppUrl("/login", request);
  if (callbackUrl?.startsWith("/")) {
    url.searchParams.set("callbackUrl", callbackUrl);
  }
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

function readLogin(value: FormDataEntryValue | null | undefined) {
  return value?.toString().trim();
}

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
  const isForm = isFormRequest(request);

  try {
    let username: string | undefined;
    let password: string | undefined;
    let callbackUrl: string | undefined;

    if (isForm) {
      const form = await request.formData();
      username =
        readLogin(form.get("username")) || readLogin(form.get("email"));
      password = form.get("password")?.toString();
      callbackUrl = form.get("callbackUrl")?.toString();
    } else {
      const body = await request.json();
      username = (body.username ?? body.email)?.trim();
      password = body.password;
      callbackUrl = body.callbackUrl;
    }

    if (!username || !password) {
      const message = "Username and password are required";
      if (isForm) {
        return loginRedirect(request, callbackUrl, message);
      }
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      const message = "Invalid username or password";
      if (isForm) {
        return loginRedirect(request, callbackUrl, message);
      }
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (user.allowedSystems.length === 0) {
      const message = "Your account has no application access";
      if (isForm) {
        return loginRedirect(request, callbackUrl, message);
      }
      return NextResponse.json({ error: message }, { status: 403 });
    }

    const token = await signSessionToken(user);
    const destination = resolveDestination(callbackUrl, user.allowedSystems);
    const cookieOptions = sessionCookieOptions(undefined, request);

    if (isForm) {
      const response = NextResponse.redirect(resolveAppUrl(destination, request), 303);
      response.cookies.set(SESSION_COOKIE, token, cookieOptions);
      return response;
    }

    const response = NextResponse.json({
      user: {
        username: user.email,
        name: user.name,
        role: user.role,
        allowedSystems: user.allowedSystems,
      },
      destination,
    });
    response.cookies.set(SESSION_COOKIE, token, cookieOptions);
    return response;
  } catch {
    const message = "Login failed";
    if (isForm) {
      return loginRedirect(request, undefined, message);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
