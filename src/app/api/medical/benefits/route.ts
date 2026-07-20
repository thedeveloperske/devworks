import { NextResponse } from "next/server";
import { buildBenefitData } from "@/features/medical/admin/benefits";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const benefits = await prisma.benefit.findMany({
    orderBy: { benefit: "asc" },
  });
  return NextResponse.json(benefits);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildBenefitData(body);

    if ("error" in result) {
      return result.error;
    }

    const benefit = await prisma.benefit.create({
      data: result.data,
    });

    return NextResponse.json(benefit, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create benefit" }, { status: 500 });
  }
}
