import type { LookupOption } from "@/features/medical/lookups/types";
import { prisma } from "@/lib/prisma";
import { serviceToListItem } from "../service-helpers";
import type { ServiceListItem } from "../types";

export async function loadServiceOptions(): Promise<LookupOption[]> {
  const rows = await prisma.service.findMany({
    select: { code: true, service: true },
    orderBy: { code: "asc" },
  });

  return rows.map((item) => ({
    value: String(item.code),
    label: item.service,
  }));
}

export async function loadServicesPageData() {
  const rows = await prisma.service.findMany({
    orderBy: { code: "asc" },
  });

  const services: ServiceListItem[] = rows.map(serviceToListItem);
  return { services };
}
