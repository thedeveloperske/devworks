import { cookies } from "next/headers";
import { loadBenefitOptions } from "@/features/medical/admin/benefits/server/load-page-data";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import { loadServiceOptions } from "@/features/medical/admin/services/server/load-page-data";
import type { LookupOption } from "@/features/medical/lookups/types";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import type {
  ManageClaimsBatchOption,
  ManageClaimsCorporateOption,
  ManageClaimsMemberAnniversary,
  ManageClaimsMemberBenefitOption,
  ManageClaimsMemberOption,
  ManageClaimsPreAuthOption,
} from "../types";

function formatDateValue(value: Date | null | undefined): string {
  if (!value || Number.isNaN(value.getTime())) return "";
  return value.toISOString().slice(0, 10);
}

/** Normalize corp ids so "0002" and "2" resolve to the same corporate. */
function normalizeCorpId(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (/^\d+$/.test(trimmed)) {
    const normalized = String(Number.parseInt(trimmed, 10));
    return Number.isNaN(Number(normalized)) ? trimmed : normalized;
  }
  return trimmed;
}

async function resolveCurrentUsername(): Promise<string> {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value
  );
  if (session?.userId) {
    const userId = Number.parseInt(session.userId, 10);
    if (!Number.isNaN(userId)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      const username = user?.username?.trim() ?? "";
      if (username) return username;
    }
  }
  return session?.email?.trim() ?? "";
}

export async function loadManageClaimsPageData(): Promise<{
  providerOptions: LookupOption[];
  serviceOptions: LookupOption[];
  corporates: ManageClaimsCorporateOption[];
  members: ManageClaimsMemberOption[];
  memberAnniversaries: ManageClaimsMemberAnniversary[];
  memberBenefits: ManageClaimsMemberBenefitOption[];
  entrantBatches: ManageClaimsBatchOption[];
  memberPreAuths: ManageClaimsPreAuthOption[];
}> {
  const currentUsername = await resolveCurrentUsername();

  const [
    providerOptions,
    serviceOptions,
    benefitOptions,
    corporates,
    memberInfos,
    principalApplicants,
    anniversaries,
    memberBenefitRows,
    entrantBatchRows,
    preAuthRows,
  ] = await Promise.all([
    loadProviderOptions(),
    loadServiceOptions(),
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
    prisma.principalApplicant.findMany({
      select: { familyNo: true, corpId: true },
    }),
    prisma.memberAnniversary.findMany({
      select: {
        memberNo: true,
        anniv: true,
        startDate: true,
        endDate: true,
      },
      orderBy: [{ memberNo: "asc" }, { anniv: "desc" }],
    }),
    prisma.memberBenefit.findMany({
      select: {
        memberNo: true,
        benefit: true,
        anniv: true,
        fund: true,
      },
      orderBy: [{ memberNo: "asc" }, { benefit: "asc" }],
    }),
    currentUsername
      ? prisma.claimsBatch.findMany({
          where: {
            dataEntryUser: {
              equals: currentUsername,
              mode: "insensitive",
            },
            dateEntryDate: { not: null },
            batchNo: { not: null },
            provider: { not: null },
          },
          select: {
            idx: true,
            batchNo: true,
            provider: true,
          },
          orderBy: [{ batchDate: "desc" }, { idx: "desc" }],
        })
      : Promise.resolve([]),
    prisma.preAuthorization.findMany({
      select: {
        code: true,
        memberNo: true,
        provider: true,
        anniv: true,
        authorityType: true,
        dateAuthorized: true,
        validityDate: true,
        reserve: true,
        preDiagnosis: true,
      },
      orderBy: { code: "desc" },
    }),
  ]);

  const benefitLabelByCode = new Map(
    benefitOptions.map((option) => [option.value, option.label])
  );

  const corporateList: ManageClaimsCorporateOption[] = corporates.map(
    (corporate) => ({
      id: corporate.id,
      corporate: corporate.corporate,
      corpId: corporate.corpId,
      policyNo: corporate.policyNo,
    })
  );

  const corporateByCorpId = new Map<
    string,
    (typeof corporates)[number]
  >();
  for (const corporate of corporates) {
    const key = normalizeCorpId(corporate.corpId);
    if (!key || corporateByCorpId.has(key)) continue;
    corporateByCorpId.set(key, corporate);
  }

  const corpIdByFamilyNo = new Map<string, string>();
  for (const info of memberInfos) {
    const corpId = normalizeCorpId(info.corpId);
    if (corpId && info.familyNo && !corpIdByFamilyNo.has(info.familyNo)) {
      corpIdByFamilyNo.set(info.familyNo, corpId);
    }
  }
  for (const principal of principalApplicants) {
    const corpId = normalizeCorpId(principal.corpId);
    if (corpId && principal.familyNo && !corpIdByFamilyNo.has(principal.familyNo)) {
      corpIdByFamilyNo.set(principal.familyNo, corpId);
    }
  }

  const members: ManageClaimsMemberOption[] = memberInfos.map((info) => {
    const corpId =
      normalizeCorpId(info.corpId) ||
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
      corpId: corporate?.corpId ?? corpId,
      memberType: isPrincipal ? "Principal" : "Dependant",
      cancelled: info.cancelled,
    };
  });

  const memberAnniversaries: ManageClaimsMemberAnniversary[] = anniversaries.map(
    (row) => ({
      memberNo: row.memberNo,
      anniv: String(row.anniv),
      startDate: formatDateValue(row.startDate),
      endDate: formatDateValue(row.endDate),
    })
  );

  const memberBenefits: ManageClaimsMemberBenefitOption[] =
    memberBenefitRows.map((row) => {
      const benefit = String(row.benefit);
      return {
        memberNo: row.memberNo,
        benefit,
        label: benefitLabelByCode.get(benefit) ?? `Benefit ${benefit}`,
        anniv: String(row.anniv),
        fund: Number(row.fund) === 1 ? "1" : "0",
      };
    });

  const entrantBatches: ManageClaimsBatchOption[] = [];
  const seenBatchKeys = new Set<string>();
  for (const row of entrantBatchRows) {
    const batchNo = row.batchNo?.trim() ?? "";
    if (!batchNo || row.provider == null) continue;
    const providerCode = String(row.provider);
    const key = `${batchNo}:${providerCode}`;
    if (seenBatchKeys.has(key)) continue;
    seenBatchKeys.add(key);
    entrantBatches.push({
      id: String(row.idx),
      batchNo,
      providerCode,
    });
  }

  const memberPreAuths: ManageClaimsPreAuthOption[] = preAuthRows.map((row) => ({
    code: String(row.code),
    memberNo: row.memberNo,
    providerCode: String(row.provider),
    anniv: row.anniv != null ? String(row.anniv) : "",
    authorityType: row.authorityType != null ? String(row.authorityType) : "",
    dateAuthorized: formatDateValue(row.dateAuthorized),
    validityDate: formatDateValue(row.validityDate),
    reserve:
      row.reserve != null
        ? Number(row.reserve).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "",
    preDiagnosis: row.preDiagnosis?.trim() ?? "",
  }));

  return {
    providerOptions,
    serviceOptions,
    corporates: corporateList,
    members,
    memberAnniversaries,
    memberBenefits,
    entrantBatches,
    memberPreAuths,
  };
}
