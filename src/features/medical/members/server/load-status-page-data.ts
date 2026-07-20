import type { MemberStatusCorporate, MemberStatusRow } from "../types";
import { prisma } from "@/lib/prisma";

/**
 * Loads every member (principals and dependants from member_info) with the
 * status of their latest cover anniversary, grouped under corporates.
 */
export async function loadMemberStatusPageData() {
  const [memberInfos, anniversaries, corporates] = await Promise.all([
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
      select: { memberNo: true, anniv: true, status: true },
      orderBy: { anniv: "desc" },
    }),
    prisma.corporate.findMany({
      select: { id: true, corporate: true, corpId: true, policyNo: true },
      orderBy: { corporate: "asc" },
    }),
  ]);

  // Ordered by anniv desc, so the first row seen per member is the latest.
  const latestAnnivByMemberNo = new Map<
    string,
    { anniv: number; status: number | null }
  >();
  for (const row of anniversaries) {
    if (latestAnnivByMemberNo.has(row.memberNo)) continue;
    latestAnnivByMemberNo.set(row.memberNo, {
      anniv: row.anniv,
      status: row.status,
    });
  }

  const corporateByCorpId = new Map(
    corporates
      .filter((corporate) => Boolean(corporate.corpId))
      .map((corporate) => [corporate.corpId!, corporate])
  );

  // Dependants may miss corp_id; fall back to the family's principal (-00).
  const corpIdByFamilyNo = new Map<string, string>();
  for (const info of memberInfos) {
    const corpId = info.corpId?.trim();
    if (corpId && info.familyNo && !corpIdByFamilyNo.has(info.familyNo)) {
      corpIdByFamilyNo.set(info.familyNo, corpId);
    }
  }

  const members: MemberStatusRow[] = memberInfos.map((info) => {
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
      corporateName: corporate?.corporate ?? "—",
      memberType: isPrincipal ? "Principal" : "Dependant",
      anniv: latest ? String(latest.anniv) : "",
      status: latest?.status != null ? String(latest.status) : "",
      cancelled: info.cancelled,
    };
  });

  const corporateList: MemberStatusCorporate[] = corporates.map(
    (corporate) => ({
      id: corporate.id,
      corporate: corporate.corporate,
      corpId: corporate.corpId,
      policyNo: corporate.policyNo,
    })
  );

  return { members, corporates: corporateList };
}
