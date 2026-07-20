import { NextResponse } from "next/server";
import { buildCategoryTypeData } from "@/features/medical/admin/categories";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const category = decodeURIComponent(id).trim().toUpperCase();

  if (!category) {
    return NextResponse.json({ error: "Invalid category code" }, { status: 400 });
  }

  const record = await prisma.tCategory.findUnique({
    where: { category },
  });

  if (!record) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const categoryId = decodeURIComponent(id).trim().toUpperCase();

  if (!categoryId) {
    return NextResponse.json({ error: "Invalid category code" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildCategoryTypeData(body);

    if ("error" in result) {
      return result.error;
    }

    if (result.data.category !== categoryId) {
      return NextResponse.json(
        { error: "Category code cannot be changed" },
        { status: 400 }
      );
    }

    const category = await prisma.tCategory.update({
      where: { category: categoryId },
      data: result.data,
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}
