import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import type { LookupOption } from "@/features/medical/lookups/types";
import { prisma } from "@/lib/prisma";
import type {
  ManageClaimsCorporateOption,
  ManageClaimsMemberOption,
  ManageClaimsProviderSummary,
} from "../types";

export async function loadManageClaimsPageData(): Promise<{
  providers: ManageClaimsProviderSummary[];
  providerOptions: LookupOption[];
  corporates: ManageClaimsCorporateOption[];
  members: ManageClaimsMemberOption[];
}> {
  const [providerOptions, claimCounts, corporates, memberInfos, anniversaries] =
    await Promise.all([
      loadProviderOptions(),
      prisma.bill.groupBy({
        by: ["provider"],
        _count: { _all: true },
      }),
      prisma.corporate.findMany({
        select: { id: true, corporate: true, corpId: true, policyNo: true },
        orderBy: { corporate: "asc" },
      }),
      prisma.memberInfo.findMany({
        select: {
          memberNo: true,
          familyNo: true,
          surname: true,
          firstName: true,
          relationToPrincipal: true,
          corpId: true,
          cancelled: true,
        },
        orderBy: [{ familyNo: "asc" }, { memberNo: "asc" }],
      }),
      prisma.memberAnniversary.findMany({
        select: { memberNo: true, anniv: true },
        orderBy: { anniv: "desc" },
      }),
    ]);

  const countByProvider = new Map(
    claimCounts.map((row) => [String(row.provider), row._count._all])
  );

  const providers: ManageClaimsProviderSummary[] = providerOptions
    .map((option) => ({
      providerCode: option.value,
      providerName: option.label,
      claimsCount: countByProvider.get(option.value) ?? 0,
    }))
    .sort((a, b) => {
      if (b.claimsCount !== a.claimsCount) return b.claimsCount - a.claimsCount;
      return a.providerName.localeCompare(b.providerName);
    });

  const corporateList: ManageClaimsCorporateOption[] = corporates.map(
    (corporate) => ({
      id: corporate.id,
      corporate: corporate.corporate,
      corpId: corporate.corpId,
      policyNo: corporate.policyNo,
    })
  );

  const corporateByCorpId = new Map(
    corporates
      .filter((corporate) => Boolean(corporate.corpId))
      .map((corporate) => [corporate.corpId!, corporate])
  );

  const corpIdByFamilyNo = new Map<string, string>();
  for (const info of memberInfos) {
    const corpId = info.corpId?.trim();
    if (corpId && info.familyNo && !corpIdByFamilyNo.has(info.familyNo)) {
      corpIdByFamilyNo.set(info.familyNo, corpId);
    }
  }

  const latestAnnivByMemberNo = new Map<string, string>();
  for (const row of anniversaries) {
    if (!latestAnnivByMemberNo.has(row.memberNo)) {
      latestAnnivByMemberNo.set(row.memberNo, String(row.anniv));
    }
  }

  const members: ManageClaimsMemberOption[] = memberInfos.map((info) => {
    const corpId =
      info.corpId?.trim() ||
      (info.familyNo ? corpIdByFamilyNo.get(info.familyNo) : undefined) ||
      "";
    const corporate = corpId ? corporateByCorpId.get(corpId) : undefined;
    const isPrincipal =
      info.relationToPrincipal === 1 || info.memberNo.endsWith("-00");

    return {
      memberNo: info.memberNo,
      familyNo: info.familyNo ?? "",
      name:
        [info.firstName?.trim(), info.surname?.trim()]
          .filter(Boolean)
          .join(" ") || "—",
      corporateId: corporate?.id ?? "",
      corpId,
      memberType: isPrincipal ? "Principal" : "Dependant",
      anniv: latestAnnivByMemberNo.get(info.memberNo) ?? "",
      cancelled: info.cancelled,
    };
  });

  return {
    providers,
    providerOptions,
    corporates: corporateList,
    members,
  };
}
