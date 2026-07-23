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
  } catch {
    return NextResponse.json(
      { error: "Failed to create hospital ward" },
      { status: 500 }
    );
  }
}
