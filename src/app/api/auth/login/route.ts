import { NextResponse } from "next/server";
import { authenticateUser, createUserSession } from "@/lib/auth";

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

    await createUserSession(user);

    return NextResponse.json({
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        allowedSystems: user.allowedSystems,
      },
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
