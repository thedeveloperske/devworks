import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth-session";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(0, request),
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
