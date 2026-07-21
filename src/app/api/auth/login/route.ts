import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
} from "@/lib/auth-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signSessionToken(user);
    const response = NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        allowedSystems: user.allowedSystems,
      },
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
