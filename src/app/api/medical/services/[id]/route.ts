import { NextResponse } from "next/server";
import { buildServiceData } from "@/features/medical/admin/services";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseServiceCode(id: string) {
  const code = Number.parseInt(id, 10);
  if (Number.isNaN(code)) {
    return null;
  }
  return code;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseServiceCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid service code" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({
    where: { code },
  });

  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  return NextResponse.json(service);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseServiceCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid service code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildServiceData(body);

    if ("error" in result) {
      return result.error;
    }

    const service = await prisma.service.update({
      where: { code },
      data: result.data,
    });

    return NextResponse.json(service);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}
