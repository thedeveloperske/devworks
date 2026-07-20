import { NextResponse } from "next/server";
import type { CategoryTypeFormData, CategoryTypeInput } from "./types";

function normalizeCategory(value?: string | null) {
  const trimmed = value?.trim().toUpperCase();
  if (!trimmed) return null;
  return trimmed.slice(0, 10);
}

export function buildCategoryTypeData(body: CategoryTypeInput) {
  const category = normalizeCategory(body.category);
  if (!category) {
    return {
      error: NextResponse.json({ error: "Category is required" }, { status: 400 }),
    };
  }

  return {
    data: { category },
  };
}

export function categoryTypeToFormValues(item: { category: string }): CategoryTypeFormData {
  return {
    category: item.category,
  };
}
