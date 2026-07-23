import { NextResponse } from "next/server";
import { buildHospitalWardData } from "@/features/medical/admin/hospital-wards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wards = await prisma.tHospitalWard.findMany({
    orderBy: { code: "asc" },
  });
  return NextResponse.json(wards);
}

async function allocateNextHospitalWardCode() {
  const rows = await prisma.$queryRaw<Array<{ next: number | bigint | string }>>`
    SELECT COALESCE(MAX(code), 0) + 1 AS next
    FROM t_hospital_ward
  `;
  return Number(rows[0]?.next ?? 1);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildHospitalWardData(body);

    if ("error" in result) {
      return result.error;
    }

    const code = await allocateNextHospitalWardCode();
    const ward = await prisma.tHospitalWard.create({
      data: {
        code,
        ward: result.data.ward,
      },
    });

    return NextResponse.json(ward, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create hospital ward", error);

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
            "Hospital ward table is missing. On the server run: npx prisma migrate deploy",
        },
        { status: 500 }
      );
    }

    if (prismaCode === "P2002") {
      return NextResponse.json(
        { error: "A hospital ward with this code already exists. Try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: prismaMessage
          ? `Failed to create hospital ward (${prismaCode ?? "error"}): ${prismaMessage}`
          : "Failed to create hospital ward",
      },
      { status: 500 }
    );
  }
}
