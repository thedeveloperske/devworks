import { NextResponse } from "next/server";
import { buildPreAuthorizationData } from "@/features/medical/care/pre-authorization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.preAuthorization.findMany({
    orderBy: { code: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildPreAuthorizationData(body);

    if ("error" in result) {
      return result.error;
    }

    const row = await prisma.preAuthorization.create({
      data: result.data,
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medical/care/pre-authorization failed:", error);
    return NextResponse.json(
      { error: "Failed to create pre-authorization" },
      { status: 500 }
    );
  }
}
