import { NextResponse } from "next/server";
import {
  buildHospitalWardData,
  formatHospitalWardCode,
  hospitalWardToFormValues,
} from "@/features/medical/admin/hospital-wards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wards = await prisma.tHospitalWard.findMany({
    orderBy: { code: "asc" },
  });
  return NextResponse.json(
    wards.map((ward) => ({
      ...hospitalWardToFormValues(ward),
      code: formatHospitalWardCode(ward.code),
    }))
  );
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

    return NextResponse.json(hospitalWardToFormValues(ward), { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A hospital ward with this code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create hospital ward" },
      { status: 500 }
    );
  }
}
