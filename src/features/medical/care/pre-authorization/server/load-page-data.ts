import { loadBenefitOptions } from "@/features/medical/admin/benefits/server/load-page-data";
import { loadHospitalWardOptions } from "@/features/medical/admin/hospital-wards/server/load-page-data";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import { formatThousands } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type {
  PreAuthorizationCorporateOption,
  PreAuthorizationListItem,
  PreAuthorizationMemberBenefitOption,
  PreAuthorizationMemberCoverPeriod,
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
      select: {
        memberNo: true,
        anniv: true,
        startDate: true,
        endDate: true,
      },
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
        sharing: true,
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
  const memberNameByMemberNo = new Map(
    memberInfos.map((info) => [
      info.memberNo,
      [info.firstName?.trim(), info.surname?.trim()]
        .filter(Boolean)
        .join(" ") || null,
    ])
  );

  const preAuthorizations: PreAuthorizationListItem[] = rows.map((row) => {
    const providerCode = String(row.provider);
    return {
      id: String(row.code),
      code: row.code,
      memberNo: row.memberNo,
      memberName: memberNameByMemberNo.get(row.memberNo) ?? null,
      provider: providerCode,
      providerName: providerNameByCode.get(providerCode) ?? null,
      dateReported: formatDateIso(row.dateReported),
      reportedBy: row.reportedBy,
      dateAuthorized: formatDateIso(row.dateAuthorized),
      authorizedBy: row.authorizedBy,
      preDiagnosis: row.preDiagnosis,
      validityDate: formatDateIso(row.validityDate),
      reserve: formatAmountString(row.reserve) || null,
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
  const coverPeriodsByMemberNo = new Map<
    string,
    PreAuthorizationMemberCoverPeriod[]
  >();
  for (const row of anniversaries) {
    const anniv = String(row.anniv);
    if (!latestAnnivByMemberNo.has(row.memberNo)) {
      latestAnnivByMemberNo.set(row.memberNo, anniv);
    }
    const periods = coverPeriodsByMemberNo.get(row.memberNo) ?? [];
    periods.push({
      anniv,
      startDate: formatDateIso(row.startDate) ?? "",
      endDate: formatDateIso(row.endDate) ?? "",
    });
    coverPeriodsByMemberNo.set(row.memberNo, periods);
  }

  const principalMemberNoByFamilyNo = new Map<string, string>();
  for (const info of memberInfos) {
    const isPrincipal =
      info.relationToPrincipal === 1 || info.memberNo.endsWith("-00");
    if (isPrincipal && info.familyNo && !principalMemberNoByFamilyNo.has(info.familyNo)) {
      principalMemberNoByFamilyNo.set(info.familyNo, info.memberNo);
    }
  }

  const familyNoByMemberNo = new Map(
    memberInfos.map((info) => [info.memberNo, info.familyNo ?? ""])
  );

  const benefitLimitByKey = new Map<string, string>();
  for (const row of memberBenefits) {
    benefitLimitByKey.set(
      `${row.memberNo}:${row.benefit}:${row.anniv}`,
      formatAmountString(row.policyLimit)
    );
  }

  const benefitsByMemberNo = new Map<
    string,
    PreAuthorizationMemberBenefitOption[]
  >();
  for (const row of memberBenefits) {
    const benefitCode = String(row.benefit);
    const anniv = String(row.anniv);
    const sharing = row.sharing != null ? String(row.sharing) : "";
    const memberLimit = formatAmountString(row.policyLimit);
    const familyNo = familyNoByMemberNo.get(row.memberNo) ?? "";
    const principalMemberNo = familyNo
      ? principalMemberNoByFamilyNo.get(familyNo)
      : undefined;
    const usesFamilyLimit = sharing === "1" || sharing === "3";
    const familyLimit =
      principalMemberNo != null
        ? benefitLimitByKey.get(
            `${principalMemberNo}:${row.benefit}:${row.anniv}`
          ) ?? memberLimit
        : memberLimit;

    const option: PreAuthorizationMemberBenefitOption = {
      benefit: benefitCode,
      label: benefitLabelByCode.get(benefitCode) ?? `Benefit ${benefitCode}`,
      anniv,
      policyLimit: memberLimit,
      bedLimit: formatAmountString(row.bedLimit),
      hospitalWard: row.hospitalWard != null ? String(row.hospitalWard) : "",
      sharing,
      utilisationLimit: usesFamilyLimit ? familyLimit : memberLimit,
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
      coverPeriods: coverPeriodsByMemberNo.get(info.memberNo) ?? [],
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
