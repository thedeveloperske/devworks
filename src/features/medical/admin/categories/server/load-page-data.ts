import type { LookupOption } from "@/features/medical/lookups/types";
import type { CategoryTypeListItem } from "../types";
import { prisma } from "@/lib/prisma";

export async function loadCategoryTypeOptions(): Promise<LookupOption[]> {
  const categories = await prisma.tCategory.findMany({
    select: { category: true },
    orderBy: { category: "asc" },
  });

  return categories.map((item) => ({
    value: item.category,
    label: item.category,
  }));
}

export async function loadCategoryTypesPageData() {
  const categories = await prisma.tCategory.findMany({
    select: { category: true },
    orderBy: { category: "asc" },
  });

  const rows: CategoryTypeListItem[] = categories.map((item) => ({
    id: item.category,
    category: item.category,
  }));

  return { categories: rows };
}
