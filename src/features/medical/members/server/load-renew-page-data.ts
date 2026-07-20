import type { MemberRenewCorporate, MemberRenewRow } from "../types";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

/**
 * Loads every member (principals and dependants from member_info) with their
 * latest cover anniversary, plus each corporate's current cover period, for
 * the Renew Members page.
 */
export async function loadMemberRenewPageData() {
  const [memberInfos, anniversaries, corporates, corpAnniversaries] =
    await Promise.all([
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
        select: { memberNo: true, anniv: true, endDate: true },
        orderBy: { anniv: "desc" },
      }),
      prisma.corporate.findMany({
        select: { id: true, corporate: true, corpId: true, policyNo: true },
        orderBy: { corporate: "asc" },
      }),
      prisma.corpAnniversary.findMany({
        select: {
          corpId: true,
          anniv: true,
          startDate: true,
          endDate: true,
          renewalDate: true,
        },
        orderBy: { anniv: "desc" },
      }),
    ]);

  // Ordered by anniv desc, so the first row seen per member is the latest.
  const latestAnnivByMemberNo = new Map<
    string,
    { anniv: number; endDate: Date | null }
  >();
  for (const row of anniversaries) {
    if (latestAnnivByMemberNo.has(row.memberNo)) continue;
    latestAnnivByMemberNo.set(row.memberNo, {
      anniv: row.anniv,
      endDate: row.endDate,
    });
  }

  const latestCorpAnnivByCorpId = new Map<
    string,
    { anniv: number; startDate: Date; endDate: Date; renewalDate: Date }
  >();
  for (const row of corpAnniversaries) {
    if (latestCorpAnnivByCorpId.has(row.corpId)) continue;
    latestCorpAnnivByCorpId.set(row.corpId, row);
  }

  const corporateByCorpId = new Map(
    corporates
      .filter((corporate) => Boolean(corporate.corpId))
      .map((corporate) => [corporate.corpId!, corporate])
  );

  // Dependants may miss corp_id; fall back to the family's principal.
  const corpIdByFamilyNo = new Map<string, string>();
  for (const info of memberInfos) {
    const corpId = info.corpId?.trim();
    if (corpId && info.familyNo && !corpIdByFamilyNo.has(info.familyNo)) {
      corpIdByFamilyNo.set(info.familyNo, corpId);
    }
  }

  const members: MemberRenewRow[] = memberInfos.map((info) => {
    const corpId =
      info.corpId?.trim() ||
      (info.familyNo ? corpIdByFamilyNo.get(info.familyNo) : undefined) ||
      "";
    const corporate = corpId ? corporateByCorpId.get(corpId) : undefined;
    const latest = latestAnnivByMemberNo.get(info.memberNo);
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
      memberType: isPrincipal ? "Principal" : "Dependant",
      anniv: latest ? String(latest.anniv) : "",
      endDate: latest ? formatDate(latest.endDate) : "",
      cancelled: info.cancelled,
    };
  });

  const corporateList: MemberRenewCorporate[] = corporates.map((corporate) => {
    const latest = corporate.corpId
      ? latestCorpAnnivByCorpId.get(corporate.corpId)
      : undefined;
    return {
      id: corporate.id,
      corporate: corporate.corporate,
      corpId: corporate.corpId,
      policyNo: corporate.policyNo,
      corpAnniv: latest ? String(latest.anniv) : "",
      corpStartDate: latest ? formatDate(latest.startDate) : "",
      corpEndDate: latest ? formatDate(latest.endDate) : "",
      corpRenewalDate: latest ? formatDate(latest.renewalDate) : "",
    };
  });

  return { members, corporates: corporateList };
}
