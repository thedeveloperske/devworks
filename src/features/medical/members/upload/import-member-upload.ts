import { NextResponse } from "next/server";
import {
  buildMemberAcceptanceData,
  buildMemberAnniversariesData,
  buildMemberBenefitsData,
  buildMemberInfoData,
  buildPrincipalApplicantData,
  formatFamilyNo,
  formatPrincipalMemberNo,
  syncMemberAnniversaries,
  syncMemberBenefits,
  upsertMemberAcceptance,
  upsertMemberInfo,
  upsertPrincipalApplicant,
} from "@/features/medical/members";
import { prisma } from "@/lib/prisma";
import {
  normalizeMemberUploadRows,
  validateNormalizedUploadRow,
  type NormalizedMemberUploadRow,
} from "./normalize-member-upload-rows";
import {
  parseMemberUploadFile,
  type RawUploadRow,
} from "./parse-member-upload-file";

export type MemberUploadRowResult = {
  rowNumber: number;
  memberNo?: string;
  familyNo?: string;
  name?: string;
  error?: string;
};

export type MemberUploadImportResult = {
  created: number;
  failed: number;
  results: MemberUploadRowResult[];
};

type CorporateContext = {
  corpId: string;
  scheme: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  anniv: string;
  benefitsByCategory: Map<
    string,
    Array<{
      benefit: string;
      policyLimit: string;
      sharing: string;
      fund: string;
      waitingPeriod: string;
      subLimitOf: string;
    }>
  >;
};

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function decimalToString(
  value: { toString(): string } | string | number | null | undefined
) {
  return value != null ? String(value) : "";
}

async function messageFromBuildError(
  result: { error?: NextResponse },
  fallback: string
) {
  if (!result.error) return fallback;
  const body = await result.error.json().catch(() => ({}));
  if (typeof body === "object" && body && "error" in body) {
    return String((body as { error: string }).error);
  }
  return fallback;
}

async function loadCorporateContext(
  corpId: string
): Promise<CorporateContext | { error: string }> {
  const corporate = await prisma.corporate.findFirst({
    where: { corpId },
    select: { corpId: true, scheme: true },
  });
  if (!corporate) {
    return { error: `Corporate ${corpId} was not found` };
  }
  const scheme = corporate.scheme?.trim();
  if (!scheme) {
    return {
      error: `Corporate ${corpId} has no abbrev (scheme) for family numbers`,
    };
  }

  const [latestAnniv, groups] = await Promise.all([
    prisma.corpAnniversary.findFirst({
      where: { corpId },
      orderBy: { anniv: "desc" },
      select: {
        anniv: true,
        startDate: true,
        endDate: true,
        renewalDate: true,
      },
    }),
    prisma.corpGroup.findMany({
      where: { corpId },
      select: {
        category: true,
        benefit: true,
        policyLimit: true,
        sharing: true,
        fund: true,
        waitingPeriod: true,
        subLimitOf: true,
        anniv: true,
      },
      orderBy: { anniv: "desc" },
    }),
  ]);

  const anniv = latestAnniv ? String(latestAnniv.anniv) : "1";
  const benefitsByCategory = new Map<
    string,
    Array<{
      benefit: string;
      policyLimit: string;
      sharing: string;
      fund: string;
      waitingPeriod: string;
      subLimitOf: string;
    }>
  >();

  for (const group of groups) {
    if (latestAnniv && Number(group.anniv) !== latestAnniv.anniv) continue;
    const category = group.category?.trim();
    const benefit = group.benefit != null ? String(group.benefit) : "";
    if (!category || !benefit) continue;
    const list = benefitsByCategory.get(category) ?? [];
    list.push({
      benefit,
      policyLimit: decimalToString(group.policyLimit),
      sharing: decimalToString(group.sharing),
      fund: decimalToString(group.fund),
      waitingPeriod: decimalToString(group.waitingPeriod),
      subLimitOf: decimalToString(group.subLimitOf),
    });
    benefitsByCategory.set(category, list);
  }

  return {
    corpId,
    scheme,
    startDate: formatDate(latestAnniv?.startDate),
    endDate: formatDate(latestAnniv?.endDate),
    renewalDate: formatDate(latestAnniv?.renewalDate),
    anniv,
    benefitsByCategory,
  };
}

async function importOneRow(
  row: NormalizedMemberUploadRow,
  context: CorporateContext,
  sequence: number
): Promise<MemberUploadRowResult> {
  const familyNo = formatFamilyNo(context.scheme, sequence);
  const memberNo = formatPrincipalMemberNo(familyNo);
  const startDate = row.startDate || context.startDate;
  const endDate = row.endDate || context.endDate;
  const renewalDate = row.renewalDate || context.renewalDate;

  if (!startDate) {
    return {
      rowNumber: row.rowNumber,
      error: "startDate is required (or set a corporate cover period first)",
    };
  }

  const categoryBenefits =
    context.benefitsByCategory.get(row.category.trim()) ?? [];

  const principalResult = buildPrincipalApplicantData({
    corpId: context.corpId,
    familyNo,
    memberNo,
    surname: row.surname,
    firstName: row.firstName,
    otherNames: row.otherNames,
    category: row.category,
    mobileNo: row.mobileNo,
    email: row.email,
  });
  if ("error" in principalResult) {
    return {
      rowNumber: row.rowNumber,
      error: await messageFromBuildError(
        principalResult,
        "Invalid principal data"
      ),
    };
  }

  const bioResult = buildMemberInfoData(
    {
      memberNo,
      familyNo,
      corpId: context.corpId,
      surname: row.surname,
      firstName: row.firstName,
      otherNames: row.otherNames,
      dob: row.dob,
      gender: row.gender,
      employmentNo: row.employmentNo,
      mobileNo: row.mobileNo,
      emailAdd: row.email,
      idPpNo: row.idPpNo,
      occupation: row.occupation,
      bloodGroup: row.bloodGroup,
      relationToPrincipal: "1",
      familyTitle: "1",
    },
    memberNo,
    familyNo,
    context.corpId
  );
  if ("error" in bioResult) {
    return {
      rowNumber: row.rowNumber,
      error: await messageFromBuildError(bioResult, "Invalid bio data"),
    };
  }

  const benefitsResult = buildMemberBenefitsData(
    categoryBenefits.map((benefit) => ({
      memberNo,
      corpId: context.corpId,
      anniv: context.anniv,
      benefit: benefit.benefit,
      policyLimit: benefit.policyLimit,
      sharing: benefit.sharing,
      fund: benefit.fund,
      waitingPeriod: benefit.waitingPeriod,
      subLimitOf: benefit.subLimitOf,
    })),
    memberNo,
    context.corpId
  );
  if ("error" in benefitsResult) {
    return {
      rowNumber: row.rowNumber,
      error: await messageFromBuildError(
        benefitsResult,
        "Invalid benefits data"
      ),
    };
  }

  const coverResult = buildMemberAnniversariesData(
    [
      {
        memberNo,
        anniv: context.anniv,
        startDate,
        endDate,
        renewalDate,
        status: "1",
      },
    ],
    memberNo
  );
  if ("error" in coverResult) {
    return {
      rowNumber: row.rowNumber,
      error: await messageFromBuildError(
        coverResult,
        "Invalid cover history data"
      ),
    };
  }

  const acceptanceResult = buildMemberAcceptanceData(
    {
      memberNo,
      status: row.status,
      statusDate: startDate,
    },
    memberNo
  );
  if ("error" in acceptanceResult) {
    return {
      rowNumber: row.rowNumber,
      error: await messageFromBuildError(
        acceptanceResult,
        "Invalid acceptance data"
      ),
    };
  }

  await prisma.$transaction(async (tx) => {
    await upsertPrincipalApplicant(tx, principalResult.data!);
    if (bioResult.data) {
      await upsertMemberInfo(tx, {
        ...bioResult.data,
        memberNo,
        familyNo,
      });
    }
    if (benefitsResult.data) {
      await syncMemberBenefits(tx, memberNo, benefitsResult.data);
    }
    if (coverResult.data) {
      await syncMemberAnniversaries(tx, memberNo, coverResult.data);
    }
    if (acceptanceResult.data) {
      await upsertMemberAcceptance(tx, {
        ...acceptanceResult.data,
        memberNo,
      });
    }
  });

  return {
    rowNumber: row.rowNumber,
    memberNo,
    familyNo,
    name: [row.firstName, row.surname].filter(Boolean).join(" "),
  };
}

/**
 * Parses an uploaded members file and inserts each principal into the same
 * tables used by manual member create.
 */
export async function importMembersFromUploadFile(
  buffer: Buffer,
  fileName: string
): Promise<MemberUploadImportResult | { error: string }> {
  const parsed = parseMemberUploadFile(buffer, fileName);
  if ("error" in parsed) return parsed;

  const normalized = normalizeMemberUploadRows(parsed.rows as RawUploadRow[]);
  if (normalized.length === 0) {
    return { error: "No member rows found in the file" };
  }

  const contextCache = new Map<string, CorporateContext | { error: string }>();
  const nextSequenceByCorpId = new Map<string, number>();
  const results: MemberUploadRowResult[] = [];

  for (const row of normalized) {
    const validationError = validateNormalizedUploadRow(row);
    if (validationError) {
      results.push({ rowNumber: row.rowNumber, error: validationError });
      continue;
    }

    let context = contextCache.get(row.corpId);
    if (!context) {
      context = await loadCorporateContext(row.corpId);
      contextCache.set(row.corpId, context);
    }
    if ("error" in context) {
      results.push({ rowNumber: row.rowNumber, error: context.error });
      continue;
    }

    let sequence = nextSequenceByCorpId.get(row.corpId);
    if (sequence == null) {
      const principalCount = await prisma.principalApplicant.count({
        where: { corpId: row.corpId },
      });
      sequence = principalCount + 1;
    }

    try {
      const result = await importOneRow(row, context, sequence);
      results.push(result);
      if (!result.error) {
        nextSequenceByCorpId.set(row.corpId, sequence + 1);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to import row";
      results.push({ rowNumber: row.rowNumber, error: message });
    }
  }

  const created = results.filter((row) => !row.error).length;
  return {
    created,
    failed: results.length - created,
    results,
  };
}
