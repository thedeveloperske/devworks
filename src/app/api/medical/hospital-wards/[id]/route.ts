import { NextResponse } from "next/server";
import {
  buildHospitalWardData,
  formatHospitalWardCode,
  hospitalWardToFormValues,
} from "@/features/medical/admin/hospital-wards";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseWardId(id: string) {
  const raw = decodeURIComponent(id).trim();
  if (!/^\d{1,2}$/.test(raw)) return null;
  const code = Number(raw);
  if (!Number.isInteger(code) || code < 0 || code > 99) return null;
  return code;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseWardId(id);

  if (code === null) {
    return NextResponse.json({ error: "Invalid hospital ward code" }, { status: 400 });
  }

  const record = await prisma.tHospitalWard.findUnique({
    where: { code },
  });

  if (!record) {
    return NextResponse.json({ error: "Hospital ward not found" }, { status: 404 });
  }

  return NextResponse.json(hospitalWardToFormValues(record));
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseWardId(id);

  if (code === null) {
    return NextResponse.json({ error: "Invalid hospital ward code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildHospitalWardData(body);

    if ("error" in result) {
      return result.error;
    }

    if (result.data.code !== code) {
      return NextResponse.json(
        { error: "Hospital ward code cannot be changed" },
        { status: 400 }
      );
    }

    const ward = await prisma.tHospitalWard.update({
      where: { code },
      data: { ward: result.data.ward },
    });

    return NextResponse.json({
      ...hospitalWardToFormValues(ward),
      code: formatHospitalWardCode(ward.code),
    });
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
