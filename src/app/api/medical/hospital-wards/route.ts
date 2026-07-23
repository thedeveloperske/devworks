import { NextResponse } from "next/server";
import { buildHospitalWardData } from "@/features/medical/admin/hospital-wards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wards = await prisma.tHospitalWard.findMany({
    orderBy: { code: "asc" },
  });
  return NextResponse.json(wards);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildHospitalWardData(body);

    if ("error" in result) {
      return result.error;
    }

    const ward = await prisma.tHospitalWard.create({
      data: result.data,
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
