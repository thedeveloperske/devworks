import { NextResponse } from "next/server";
import { buildProviderData } from "@/features/medical/admin/providers";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseProviderCode(id: string) {
  const code = Number.parseInt(id, 10);
  if (Number.isNaN(code)) {
    return null;
  }
  return code;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseProviderCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid provider ID" }, { status: 400 });
  }

  const provider = await prisma.provider.findUnique({
    where: { code },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseProviderCode(id);

  if (code == null) {
    return NextResponse.json({ error: "Invalid provider ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildProviderData(body);

    if ("error" in result) {
      return result.error;
    }

    const provider = await prisma.provider.update({
      where: { code },
      data: result.data,
    });

    return NextResponse.json(provider);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update provider" }, { status: 500 });
  }
}
