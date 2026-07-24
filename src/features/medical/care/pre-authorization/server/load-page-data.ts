import { loadHospitalWardOptions } from "@/features/medical/admin/hospital-wards/server/load-page-data";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import { prisma } from "@/lib/prisma";
import type {
  PreAuthorizationCorporateOption,
  PreAuthorizationListItem,
  PreAuthorizationMemberOption,
} from "../types";

function formatDateIso(value: Date | null | undefined) {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export async function loadPreAuthorizationPageData() {
  const [
    rows,
    providerOptions,
    hospitalWardOptions,
    corporates,
    memberInfos,
    anniversaries,
  ] = await Promise.all([
    prisma.preAuthorization.findMany({
      orderBy: { code: "desc" },
    }),
    loadProviderOptions(),
    loadHospitalWardOptions(),
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

  const providerNameByCode = new Map(
    providerOptions.map((option) => [option.value, option.label])
  );

  const preAuthorizations: PreAuthorizationListItem[] = rows.map((row) => {
    const providerCode = String(row.provider);
    return {
      id: String(row.code),
      code: row.code,
      memberNo: row.memberNo,
      provider: providerCode,
      providerName: providerNameByCode.get(providerCode) ?? null,
      dateReported: formatDateIso(row.dateReported),
      reportedBy: row.reportedBy,
      dateAuthorized: formatDateIso(row.dateAuthorized),
      authorizedBy: row.authorizedBy,
      preDiagnosis: row.preDiagnosis,
      validityDate: formatDateIso(row.validityDate),
    };
  });

  const corporateList: PreAuthorizationCorporateOption[] = corporates.map(
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

  const latestAnnivByMemberNo = new Map<string, string>();
  for (const row of anniversaries) {
    if (latestAnnivByMemberNo.has(row.memberNo)) continue;
    latestAnnivByMemberNo.set(row.memberNo, String(row.anniv));
  }

  // Dependants may miss corp_id; fall back to the family's principal corp.
  const corpIdByFamilyNo = new Map<string, string>();
  for (const info of memberInfos) {
    const corpId = info.corpId?.trim();
    if (corpId && info.familyNo && !corpIdByFamilyNo.has(info.familyNo)) {
      corpIdByFamilyNo.set(info.familyNo, corpId);
    }
  }

  const members: PreAuthorizationMemberOption[] = memberInfos.map((info) => {
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
    preAuthorizations,
    corporates: corporateList,
    members,
    providerOptions,
    hospitalWardOptions,
  };
}
