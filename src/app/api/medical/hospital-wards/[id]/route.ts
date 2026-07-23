import { NextResponse } from "next/server";
import { buildHospitalWardData } from "@/features/medical/admin/hospital-wards";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseWardCode(id: string) {
  const code = Number.parseInt(id, 10);
  if (Number.isNaN(code)) {
    return null;
  }
  return code;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseWardCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid hospital ward code" }, { status: 400 });
  }

  const ward = await prisma.tHospitalWard.findUnique({
    where: { code },
  });

  if (!ward) {
    return NextResponse.json({ error: "Hospital ward not found" }, { status: 404 });
  }

  return NextResponse.json(ward);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseWardCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid hospital ward code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildHospitalWardData(body);

    if ("error" in result) {
      return result.error;
    }

    const ward = await prisma.tHospitalWard.update({
      where: { code },
      data: result.data,
    });

    return NextResponse.json(ward);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Hospital ward not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update hospital ward" },
      { status: 500 }
    );
  }
}
