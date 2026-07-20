import { NextResponse } from "next/server";
import { buildBenefitData } from "@/features/medical/admin/benefits";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseBenefitCode(id: string) {
  const code = Number.parseInt(id, 10);
  if (Number.isNaN(code)) {
    return null;
  }
  return code;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseBenefitCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid benefit code" }, { status: 400 });
  }

  const benefit = await prisma.benefit.findUnique({
    where: { code },
  });

  if (!benefit) {
    return NextResponse.json({ error: "Benefit not found" }, { status: 404 });
  }

  return NextResponse.json(benefit);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseBenefitCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid benefit code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildBenefitData(body);

    if ("error" in result) {
      return result.error;
    }

    const benefit = await prisma.benefit.update({
      where: { code },
      data: result.data,
    });

    return NextResponse.json(benefit);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Benefit not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update benefit" }, { status: 500 });
  }
}
