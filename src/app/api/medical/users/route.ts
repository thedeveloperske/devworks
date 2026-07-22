import { NextResponse } from "next/server";
import { buildUserCreateData } from "@/features/medical/admin/users/build-user-data";
import { userToListItem } from "@/features/medical/admin/users";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: [{ fullName: "asc" }, { username: "asc" }, { id: "asc" }],
  });
  return NextResponse.json(users.map(userToListItem));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await buildUserCreateData(body);
    if ("error" in result) return result.error;

    const existing = await prisma.user.findFirst({
      where: {
        username: { equals: result.data.username!, mode: "insensitive" },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this username already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({ data: result.data });
    return NextResponse.json(userToListItem(user), { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medical/users failed:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
