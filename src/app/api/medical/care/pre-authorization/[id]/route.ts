import { NextResponse } from "next/server";
import { buildPreAuthorizationData } from "@/features/medical/care/pre-authorization";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseCode(id: string) {
  const code = Number.parseInt(id, 10);
  if (Number.isNaN(code)) return null;
  return code;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid pre-authorization code" }, { status: 400 });
  }

  const row = await prisma.preAuthorization.findUnique({
    where: { code },
  });

  if (!row) {
    return NextResponse.json({ error: "Pre-authorization not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid pre-authorization code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildPreAuthorizationData(body);

    if ("error" in result) {
      return result.error;
    }

    const row = await prisma.preAuthorization.update({
      where: { code },
      data: result.data,
    });

    return NextResponse.json(row);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Pre-authorization not found" },
        { status: 404 }
      );
    }
    console.error("PUT /api/medical/care/pre-authorization/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update pre-authorization" },
      { status: 500 }
    );
  }
}
