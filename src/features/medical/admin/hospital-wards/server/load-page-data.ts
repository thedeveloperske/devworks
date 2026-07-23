import type { LookupOption } from "@/features/medical/lookups/types";
import { hospitalWardToListItem } from "../hospital-ward-helpers";
import type { HospitalWardListItem } from "../types";
import { prisma } from "@/lib/prisma";

export async function loadHospitalWardOptions(): Promise<LookupOption[]> {
  const wards = await prisma.tHospitalWard.findMany({
    select: { code: true, ward: true },
    orderBy: { code: "asc" },
  });

  return wards.map((item) => ({
    value: String(item.code),
    label: `${item.code} — ${item.ward}`,
  }));
}

export async function loadHospitalWardsPageData() {
  const wards = await prisma.tHospitalWard.findMany({
    orderBy: { code: "asc" },
  });

  const rows: HospitalWardListItem[] = wards.map(hospitalWardToListItem);
  return { wards: rows };
}
