import { NextResponse } from "next/server";
import { buildUserUpdateData } from "@/features/medical/admin/users/build-user-data";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseUserId(id: string) {
  const userId = Number.parseInt(id, 10);
  if (Number.isNaN(userId)) return null;
  return userId;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const userId = parseUserId(id);
  if (userId == null) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    department: user.department,
    status: user.status,
    allowedSystems: user.allowedSystems,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const userId = parseUserId(id);
  if (userId == null) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await buildUserUpdateData(body);
    if ("error" in result) return result.error;

    const duplicate = await prisma.user.findFirst({
      where: {
        username: { equals: String(result.data.username), mode: "insensitive" },
        NOT: { id: userId },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A user with this username already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: result.data,
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      department: user.department,
      status: user.status,
      allowedSystems: user.allowedSystems,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("PUT /api/medical/users/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
