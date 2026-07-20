import { NextResponse } from "next/server";
import { buildCategoryTypeData } from "@/features/medical/admin/categories";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.tCategory.findMany({
    orderBy: { category: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildCategoryTypeData(body);

    if ("error" in result) {
      return result.error;
    }

    const category = await prisma.tCategory.create({
      data: result.data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A category with this code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
