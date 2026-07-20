import { NextResponse } from "next/server";
import { buildProviderData } from "@/features/medical/admin/providers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const providers = await prisma.provider.findMany({
    orderBy: { provider: "asc" },
  });
  return NextResponse.json(providers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildProviderData(body);

    if ("error" in result) {
      return result.error;
    }

    const provider = await prisma.provider.create({
      data: {
        ...result.data,
        dateEntered: new Date(),
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create provider" }, { status: 500 });
  }
}
