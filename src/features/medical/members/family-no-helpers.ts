import { NextResponse } from "next/server";

/** Principal is always member suffix `00` within a family. */
export const PRINCIPAL_MEMBER_SUFFIX = "00";

type FamilyNoClient = {
  corporate: {
    findFirst: (args: {
      where: { corpId: string };
      select: { scheme: true };
    }) => Promise<{ scheme: string | null } | null>;
  };
  principalApplicant: {
    count: (args: { where: { corpId: string } }) => Promise<number>;
  };
};

type DependantNoClient = {
  memberInfo: {
    findMany: (args: {
      where: { familyNo: string };
      select: { memberNo: true };
    }) => Promise<Array<{ memberNo: string }>>;
  };
};

export function formatFamilyNo(scheme: string, sequence: number) {
  return `${scheme.trim().toUpperCase()}-${sequence}`;
}

/** `{familyNo}-{suffix}` e.g. ABC-1-00. */
export function formatMemberNo(familyNo: string, memberSuffix: string) {
  return `${familyNo.trim()}-${memberSuffix}`;
}

export function formatPrincipalMemberNo(familyNo: string) {
  return formatMemberNo(familyNo, PRINCIPAL_MEMBER_SUFFIX);
}

export function formatDependantMemberSuffix(sequence: number) {
  return String(sequence).padStart(2, "0");
}

/** Preview next family no from scheme + existing principal count. */
export function previewNextFamilyNo(
  scheme: string | null | undefined,
  principalCount: number
) {
  const trimmed = scheme?.trim();
  if (!trimmed) return "";
  return formatFamilyNo(trimmed, principalCount + 1);
}

export function previewNextPrincipalMemberNo(
  scheme: string | null | undefined,
  principalCount: number
) {
  const familyNo = previewNextFamilyNo(scheme, principalCount);
  return familyNo ? formatPrincipalMemberNo(familyNo) : "";
}

/**
 * Next family + principal member numbers for a corporate:
 * family `{scheme}-{n}`, member `{familyNo}-00`.
 */
export async function allocateNextFamilyNo(
  prisma: FamilyNoClient,
  corpId: string | null | undefined
): Promise<
  { familyNo: string; memberNo: string } | { error: NextResponse }
> {
  const trimmedCorpId = corpId?.trim();
  if (!trimmedCorpId) {
    return {
      error: NextResponse.json(
        { error: "Corporate is required to generate family number" },
        { status: 400 }
      ),
    };
  }

  const corporate = await prisma.corporate.findFirst({
    where: { corpId: trimmedCorpId },
    select: { scheme: true },
  });

  const scheme = corporate?.scheme?.trim();
  if (!scheme) {
    return {
      error: NextResponse.json(
        {
          error:
            "Corporate abbrev (scheme) is required to generate family number",
        },
        { status: 400 }
      ),
    };
  }

  const principalCount = await prisma.principalApplicant.count({
    where: { corpId: trimmedCorpId },
  });

  const familyNo = formatFamilyNo(scheme, principalCount + 1);
  return {
    familyNo,
    memberNo: formatPrincipalMemberNo(familyNo),
  };
}

/**
 * Next dependant member number for a family: `{familyNo}-01`, `-02`, …
 * (principal suffix `00` is skipped).
 */
export async function allocateNextDependantMemberNo(
  prisma: DependantNoClient,
  familyNo: string | null | undefined
): Promise<{ memberNo: string } | { error: NextResponse }> {
  const trimmedFamilyNo = familyNo?.trim();
  if (!trimmedFamilyNo) {
    return {
      error: NextResponse.json(
        {
          error:
            "Family number is required to generate dependant member number",
        },
        { status: 400 }
      ),
    };
  }

  const members = await prisma.memberInfo.findMany({
    where: { familyNo: trimmedFamilyNo },
    select: { memberNo: true },
  });

  const prefix = `${trimmedFamilyNo}-`;
  let maxSuffix = 0;
  for (const { memberNo } of members) {
    if (!memberNo.startsWith(prefix)) continue;
    const suffix = memberNo.slice(prefix.length);
    if (!/^\d{1,2}$/.test(suffix)) continue;
    if (suffix === PRINCIPAL_MEMBER_SUFFIX) continue;
    const parsed = Number(suffix);
    if (parsed > maxSuffix) maxSuffix = parsed;
  }

  const nextSuffix = formatDependantMemberSuffix(maxSuffix + 1);
  if (nextSuffix === PRINCIPAL_MEMBER_SUFFIX) {
    return {
      error: NextResponse.json(
        { error: "Unable to allocate dependant member number" },
        { status: 500 }
      ),
    };
  }

  return {
    memberNo: formatMemberNo(trimmedFamilyNo, nextSuffix),
  };
}
