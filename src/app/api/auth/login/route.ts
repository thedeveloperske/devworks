import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
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
  const url = new URL("/login", request.url);
  if (callbackUrl?.startsWith("/")) {
    url.searchParams.set("callbackUrl", callbackUrl);
  }
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const isForm = isFormRequest(request);

  try {
    let email: string | undefined;
    let password: string | undefined;
    let callbackUrl: string | undefined;

    if (isForm) {
      const form = await request.formData();
      email = form.get("email")?.toString().trim();
      password = form.get("password")?.toString();
      callbackUrl = form.get("callbackUrl")?.toString();
    } else {
      const body = await request.json();
      email = body.email?.trim();
      password = body.password;
      callbackUrl = body.callbackUrl;
    }

    if (!email || !password) {
      const message = "Email and password are required";
      if (isForm) {
        return loginRedirect(request, callbackUrl, message);
      }
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      const message = "Invalid email or password";
      if (isForm) {
        return loginRedirect(request, callbackUrl, message);
      }
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const token = await signSessionToken(user);
    const destination =
      callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/applications";
    const cookieOptions = sessionCookieOptions(undefined, request);

    if (isForm) {
      const response = NextResponse.redirect(new URL(destination, request.url), 303);
      response.cookies.set(SESSION_COOKIE, token, cookieOptions);
      return response;
    }

    const response = NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        allowedSystems: user.allowedSystems,
      },
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
