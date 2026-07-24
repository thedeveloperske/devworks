import { loadBenefitOptions } from "@/features/medical/admin/benefits/server/load-page-data";
import { loadHospitalWardOptions } from "@/features/medical/admin/hospital-wards/server/load-page-data";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import { formatThousands } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type {
  PreAuthorizationCorporateOption,
  PreAuthorizationListItem,
  PreAuthorizationMemberBenefitOption,
  PreAuthorizationMemberOption,
} from "../types";

function formatDateIso(value: Date | null | undefined) {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function formatAmountString(
  value: { toString(): string } | number | null | undefined
) {
  if (value == null) return "";
  return formatThousands(String(value));
}

export async function loadPreAuthorizationPageData() {
  const [
    rows,
    providerOptions,
    hospitalWardOptions,
    benefitOptions,
    corporates,
    memberInfos,
    anniversaries,
    memberBenefits,
  ] = await Promise.all([
    prisma.preAuthorization.findMany({
      orderBy: { code: "desc" },
    }),
    loadProviderOptions(),
    loadHospitalWardOptions(),
    loadBenefitOptions(),
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
    prisma.memberBenefit.findMany({
      select: {
        memberNo: true,
        benefit: true,
        anniv: true,
        policyLimit: true,
        bedLimit: true,
        hospitalWard: true,
      },
      orderBy: [{ memberNo: "asc" }, { benefit: "asc" }],
    }),
  ]);

  const providerNameByCode = new Map(
    providerOptions.map((option) => [option.value, option.label])
  );
  const benefitLabelByCode = new Map(
    benefitOptions.map((option) => [option.value, option.label])
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

  const benefitsByMemberNo = new Map<
    string,
    PreAuthorizationMemberBenefitOption[]
  >();
  for (const row of memberBenefits) {
    const benefitCode = String(row.benefit);
    const option: PreAuthorizationMemberBenefitOption = {
      benefit: benefitCode,
      label: benefitLabelByCode.get(benefitCode) ?? `Benefit ${benefitCode}`,
      anniv: String(row.anniv),
      policyLimit: formatAmountString(row.policyLimit),
      bedLimit: formatAmountString(row.bedLimit),
      hospitalWard: row.hospitalWard != null ? String(row.hospitalWard) : "",
    };
    const list = benefitsByMemberNo.get(row.memberNo) ?? [];
    list.push(option);
    benefitsByMemberNo.set(row.memberNo, list);
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
      benefits: benefitsByMemberNo.get(info.memberNo) ?? [],
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
