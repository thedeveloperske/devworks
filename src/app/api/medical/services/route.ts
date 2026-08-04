import { NextResponse } from "next/server";
import { buildServiceData } from "@/features/medical/admin/services";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { code: "asc" },
  });
  return NextResponse.json(services);
}

async function allocateNextServiceCode() {
  const rows = await prisma.$queryRaw<Array<{ next: number | bigint | string }>>`
    SELECT COALESCE(MAX(code), 0) + 1 AS next
    FROM service
  `;
  return Number(rows[0]?.next ?? 1);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildServiceData(body);

    if ("error" in result) {
      return result.error;
    }

    const code = await allocateNextServiceCode();
    if (code > 99999) {
      return NextResponse.json(
        { error: "Service code limit reached (max 99999)" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        code,
        service: result.data.service,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create service", error);

    const prismaCode =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : null;
    const prismaMessage =
      error && typeof error === "object" && "message" in error
        ? String(error.message)
        : null;

    if (prismaCode === "P2021") {
      return NextResponse.json(
        {
          error:
            "Service table is missing. On the server run: npx prisma migrate deploy",
        },
        { status: 500 }
      );
    }

    if (prismaCode === "P2002") {
      return NextResponse.json(
        { error: "A service with this code already exists. Try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: prismaMessage
          ? `Failed to create service (${prismaCode ?? "error"}): ${prismaMessage}`
          : "Failed to create service",
      },
      { status: 500 }
    );
  }
}
