import { loadAgentOptions } from "@/features/medical/admin/agents/server/load-page-data";
import { loadBenefitOptions } from "@/features/medical/admin/benefits/server/load-page-data";
import { branchOptions } from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";
import type {
  MemberListItem,
  MembersCorporateOption,
  MembersCorpGroupBenefit,
  PrincipalOption,
} from "../types";
import { prisma } from "@/lib/prisma";

function formatAnniversaryDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function decimalToString(value: { toString(): string } | number | null | undefined) {
  if (value == null) return "";
  return String(value);
}

/** Map corporate.branch (key or label) to principal form branch key. */
function normalizeCorporateBranch(branch: string | null | undefined) {
  const trimmed = branch?.trim() ?? "";
  if (!trimmed) return "";
  if (branchOptions.some((option) => option.value === trimmed)) {
    return trimmed;
  }
  const byLabel = branchOptions.find(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase()
  );
  // Only known branch keys are valid Int fields on principal_applicant.
  return byLabel?.value ?? "";
}

function buildMaxAnnivByCorpId(
  groups: Array<{
    corpId: string | null;
    anniv: { toString(): string } | number | null;
  }>
) {
  const maxAnnivByCorpId = new Map<string, number>();
  for (const group of groups) {
    if (!group.corpId || group.anniv == null) continue;
    const anniv = Number(group.anniv);
    if (!Number.isFinite(anniv)) continue;
    const current = maxAnnivByCorpId.get(group.corpId);
    if (current == null || anniv > current) {
      maxAnnivByCorpId.set(group.corpId, anniv);
    }
  }
  return maxAnnivByCorpId;
}

function buildCategoryOptionsByCorpId(
  groups: Array<{
    corpId: string | null;
    anniv: { toString(): string } | number | null;
    category: string | null;
  }>,
  maxAnnivByCorpId: Map<string, number>
) {
  const categoriesByCorpId = new Map<string, Set<string>>();
  for (const group of groups) {
    if (!group.corpId || group.anniv == null) continue;
    const category = group.category?.trim();
    if (!category) continue;
    const maxAnniv = maxAnnivByCorpId.get(group.corpId);
    if (maxAnniv == null || Number(group.anniv) !== maxAnniv) continue;

    const categories = categoriesByCorpId.get(group.corpId) ?? new Set<string>();
    categories.add(category);
    categoriesByCorpId.set(group.corpId, categories);
  }

  const optionsByCorpId = new Map<string, LookupOption[]>();
  for (const [corpId, categories] of categoriesByCorpId) {
    optionsByCorpId.set(
      corpId,
      [...categories]
        .sort((a, b) => a.localeCompare(b))
        .map((category) => ({ value: category, label: category }))
    );
  }
  return optionsByCorpId;
}

function buildCorpGroupBenefitsByCorpId(
  groups: Array<{
    corpId: string | null;
    anniv: { toString(): string } | number | null;
    category: string | null;
    benefit: number | null;
    policyLimit: { toString(): string } | number | null;
    sharing: number | null;
    subLimitOf: number | null;
    waitingPeriod: number | null;
  }>,
  maxAnnivByCorpId: Map<string, number>
) {
  const benefitsByCorpId = new Map<string, MembersCorpGroupBenefit[]>();
  for (const group of groups) {
    if (!group.corpId || group.anniv == null || group.benefit == null) continue;
    const category = group.category?.trim();
    if (!category) continue;
    const maxAnniv = maxAnnivByCorpId.get(group.corpId);
    if (maxAnniv == null || Number(group.anniv) !== maxAnniv) continue;

    const row: MembersCorpGroupBenefit = {
      category,
      anniv: String(group.anniv),
      benefit: String(group.benefit),
      policyLimit: decimalToString(group.policyLimit),
      sharing: group.sharing != null ? String(group.sharing) : "",
      subLimitOf: group.subLimitOf != null ? String(group.subLimitOf) : "",
      waitingPeriod:
        group.waitingPeriod != null ? String(group.waitingPeriod) : "",
    };

    const rows = benefitsByCorpId.get(group.corpId) ?? [];
    if (
      !rows.some(
        (existing) =>
          existing.category === row.category &&
          existing.benefit === row.benefit
      )
    ) {
      rows.push(row);
      benefitsByCorpId.set(group.corpId, rows);
    }
  }
  return benefitsByCorpId;
}

export async function loadMembersPageData() {
  const [
    principals,
    corporates,
    corpAnniversaries,
    corpGroups,
    agentOptions,
    benefitOptions,
  ] = await Promise.all([
    prisma.principalApplicant.findMany({
      select: {
        memberNo: true,
        firstName: true,
        surname: true,
        corpId: true,
        email: true,
        mobileNo: true,
        telNo: true,
      },
      orderBy: [{ surname: "asc" }, { firstName: "asc" }],
    }),
    prisma.corporate.findMany({
      select: {
        id: true,
        corporate: true,
        corpId: true,
        policyNo: true,
        branch: true,
        businessClass: true,
        agentId: true,
      },
      orderBy: { corporate: "asc" },
    }),
    prisma.corpAnniversary.findMany({
      select: {
        corpId: true,
        anniv: true,
        endDate: true,
        renewalDate: true,
      },
      orderBy: [{ anniv: "desc" }, { endDate: "desc" }],
    }),
    prisma.corpGroup.findMany({
      select: {
        corpId: true,
        anniv: true,
        category: true,
        benefit: true,
        policyLimit: true,
        sharing: true,
        subLimitOf: true,
        waitingPeriod: true,
      },
    }),
    loadAgentOptions(),
    loadBenefitOptions(),
  ]);

  const latestAnniversaryByCorpId = new Map<
    string,
    { anniv: string; endDate: string; renewalDate: string }
  >();
  for (const anniversary of corpAnniversaries) {
    if (latestAnniversaryByCorpId.has(anniversary.corpId)) continue;
    latestAnniversaryByCorpId.set(anniversary.corpId, {
      anniv: String(anniversary.anniv),
      endDate: formatAnniversaryDate(anniversary.endDate),
      renewalDate: formatAnniversaryDate(anniversary.renewalDate),
    });
  }

  const maxAnnivByCorpId = buildMaxAnnivByCorpId(corpGroups);
  const categoryOptionsByCorpId = buildCategoryOptionsByCorpId(
    corpGroups,
    maxAnnivByCorpId
  );
  const corpGroupBenefitsByCorpId = buildCorpGroupBenefitsByCorpId(
    corpGroups,
    maxAnnivByCorpId
  );

  const corporateByCorpId = new Map(
    corporates
      .filter((corporate) => Boolean(corporate.corpId))
      .map((corporate) => [corporate.corpId!, corporate])
  );

  const rows: MemberListItem[] = principals.map((principal) => {
    const corporate = principal.corpId
      ? corporateByCorpId.get(principal.corpId)
      : undefined;

    return {
      id: principal.memberNo,
      memberNumber: principal.memberNo,
      firstName: principal.firstName?.trim() || "—",
      lastName: principal.surname?.trim() || "—",
      corporateId: corporate?.id ?? "",
      corporateName: corporate?.corporate ?? "—",
      memberType: "PRINCIPAL",
      status: "ACTIVE",
      phone: principal.mobileNo || principal.telNo || null,
      email: principal.email,
    };
  });

  const corporateList: MembersCorporateOption[] = corporates.map((corporate) => {
    const latest = corporate.corpId
      ? latestAnniversaryByCorpId.get(corporate.corpId)
      : undefined;
    return {
      id: corporate.id,
      corporate: corporate.corporate,
      corpId: corporate.corpId,
      policyNo: corporate.policyNo,
      branch: normalizeCorporateBranch(corporate.branch),
      businessClass: corporate.businessClass,
      agentId: corporate.agentId,
      anniv: latest?.anniv ?? "",
      endDate: latest?.endDate ?? "",
      renewalDate: latest?.renewalDate ?? "",
      categoryOptions: corporate.corpId
        ? (categoryOptionsByCorpId.get(corporate.corpId) ?? [])
        : [],
      corpGroupBenefits: corporate.corpId
        ? (corpGroupBenefitsByCorpId.get(corporate.corpId) ?? [])
        : [],
    };
  });

  const corporateOptions: LookupOption[] = corporates.map((corporate) => ({
    value: corporate.id,
    label: corporate.corpId
      ? `${corporate.corporate} (${corporate.corpId})`
      : corporate.corporate,
  }));

  const principalOptions: PrincipalOption[] = rows.map((principal) => ({
    id: principal.id,
    corporateId: principal.corporateId,
    label: `${principal.firstName} ${principal.lastName} (${principal.memberNumber})`,
  }));

  return {
    members: rows,
    corporates: corporateList,
    corporateOptions,
    principalOptions,
    agentOptions,
    benefitOptions,
  };
}
