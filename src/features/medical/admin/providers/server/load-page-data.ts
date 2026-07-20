import type { LookupOption } from "@/features/medical/lookups/types";
import type { ProviderListItem } from "../types";
import { prisma } from "@/lib/prisma";

export async function loadProviderOptions(): Promise<LookupOption[]> {
  const providers = await prisma.provider.findMany({
    select: { code: true, provider: true },
    orderBy: { provider: "asc" },
  });

  return providers.map((row) => ({
    value: String(row.code),
    label: row.provider,
  }));
}

export async function loadProvidersPageData() {
  const providers = await prisma.provider.findMany({
    select: {
      code: true,
      provider: true,
      mobileNo: true,
      email: true,
      town: true,
      contactPerson: true,
      status: true,
      approved: true,
    },
    orderBy: { provider: "asc" },
  });

  const rows: ProviderListItem[] = providers.map((row) => ({
    id: String(row.code),
    provider: row.provider,
    mobileNo: row.mobileNo,
    email: row.email,
    town: row.town != null ? String(row.town) : null,
    contactPerson: row.contactPerson,
    status: row.status,
    approved: row.approved,
  }));

  return { providers: rows };
}
