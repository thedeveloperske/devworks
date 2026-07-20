import type { LookupOption } from "@/features/medical/lookups/types";
import type { BenefitListItem } from "../types";
import { prisma } from "@/lib/prisma";

export async function loadBenefitOptions(): Promise<LookupOption[]> {
  const benefits = await prisma.benefit.findMany({
    select: { code: true, benefit: true },
    orderBy: { benefit: "asc" },
  });

  return benefits.map((item) => ({
    value: String(item.code),
    label: item.benefit,
  }));
}

export async function loadBenefitsPageData() {
  const benefits = await prisma.benefit.findMany({
    select: {
      code: true,
      benefit: true,
      beneClass: true,
    },
    orderBy: { benefit: "asc" },
  });

  const rows: BenefitListItem[] = benefits.map((item) => ({
    id: String(item.code),
    benefit: item.benefit,
    beneClass: item.beneClass != null ? String(item.beneClass) : null,
  }));

  return { benefits: rows };
}
