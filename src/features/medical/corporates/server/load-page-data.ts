import type { CorporateListItem, RenewalListItem } from "../types";
import { corpAnniversaryToRenewalListItem } from "../cover-date-helpers";
import { loadAgentOptions } from "@/features/medical/admin/agents/server/load-page-data";
import { loadBenefitOptions } from "@/features/medical/admin/benefits/server/load-page-data";
import { loadCategoryTypeOptions } from "@/features/medical/admin/categories/server/load-page-data";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function loadCorporatesPageData() {
  const [
    corporates,
    corpAnniversaries,
    agentOptions,
    benefitOptions,
    categoryOptions,
    providerOptions,
  ] = await Promise.all([
    prisma.corporate.findMany({
      select: {
        id: true,
        corporate: true,
        corpId: true,
        policyNo: true,
        agentId: true,
        businessClass: true,
      },
      orderBy: { corporate: "asc" },
    }),
    prisma.corpAnniversary.findMany({
      include: {
        corporate: {
          select: {
            corporate: true,
            corpId: true,
            policyNo: true,
          },
        },
      },
      orderBy: [{ endDate: "desc" }, { idx: "desc" }],
    }),
    loadAgentOptions(),
    loadBenefitOptions(),
    loadCategoryTypeOptions(),
    loadProviderOptions(),
  ]);

  // First row seen per corpId is the latest (ordered by endDate desc).
  const latestPeriodByCorpId = new Map<
    string,
    { startDate: Date; endDate: Date }
  >();
  for (const row of corpAnniversaries) {
    if (!row.corpId || latestPeriodByCorpId.has(row.corpId)) continue;
    latestPeriodByCorpId.set(row.corpId, {
      startDate: row.startDate,
      endDate: row.endDate,
    });
  }

  const rows: CorporateListItem[] = corporates.map((corporate) => {
    const period = corporate.corpId
      ? latestPeriodByCorpId.get(corporate.corpId)
      : undefined;
    return {
      id: corporate.id,
      policyNo: corporate.policyNo,
      businessClass: corporate.businessClass,
      corporate: corporate.corporate,
      corpId: corporate.corpId,
      agentId: corporate.agentId,
      corpStartDate: period ? formatDate(period.startDate) : "",
      corpEndDate: period ? formatDate(period.endDate) : "",
    };
  });

  const renewals: RenewalListItem[] = corpAnniversaries.map(
    corpAnniversaryToRenewalListItem
  );

  return {
    corporates: rows,
    renewals,
    agentOptions,
    benefitOptions,
    categoryOptions,
    providerOptions,
  };
}
