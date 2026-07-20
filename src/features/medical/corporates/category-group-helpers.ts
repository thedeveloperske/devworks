import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { CategoryGroupFormData, CategoryGroupInput } from "./types";

function trimOrNull(value?: string | null, maxLength?: number, uppercase = false) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const normalized = uppercase ? trimmed.toUpperCase() : trimmed;
  if (maxLength != null && normalized.length > maxLength) {
    return normalized.slice(0, maxLength);
  }
  return normalized;
}

function parseOptionalInt(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return { error: `${label} must be a whole number` };
  }
  return { value: parsed };
}

function parseOptionalDecimal(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null };
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { error: `${label} must be a number` };
  }
  return { value: parsed };
}

function parseRequiredCategory(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  return { value: trimmed };
}

function decimalToString(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return "";
  return String(value);
}

export function hasCategoryGroupRowInput(group?: CategoryGroupInput) {
  if (!group) return false;
  return Boolean(
    group.category?.trim() ||
      group.benefit?.trim() ||
      group.fund?.trim() === "1" ||
      group.policyLimit?.trim() ||
      group.subLimitOf?.trim() ||
      group.sharing?.trim() ||
      group.copayAmount?.trim() ||
      group.waitingPeriod?.trim()
  );
}

type CategoryGroupSyncRow = {
  idx?: number;
  corpId: string;
  anniv: number | null;
  category: string | null;
  benefit: number | null;
  fund: number | null;
  policyLimit: number | null;
  subLimitOf: number | null;
  sharing: number | null;
  copayAmount: number | null;
  waitingPeriod: number | null;
};

type BuildCategoryGroupsResult =
  | { data: CategoryGroupSyncRow[] }
  | { error: NextResponse };

function buildCategoryGroupRowData(
  group: CategoryGroupInput,
  corpId: string,
  defaultAnniv: string,
  rowLabel: string
): { data: CategoryGroupSyncRow } | { error: NextResponse } {
  const categoryResult = parseRequiredCategory(group.category, "Category");
  if ("error" in categoryResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${categoryResult.error}` },
        { status: 400 }
      ),
    };
  }

  const annivValue = group.anniv?.trim() || defaultAnniv.trim() || "1";
  const annivResult = parseOptionalDecimal(annivValue, "Anniv");
  if ("error" in annivResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${annivResult.error}` },
        { status: 400 }
      ),
    };
  }

  const intFields: { key: Exclude<keyof CategoryGroupInput, "idx">; label: string }[] = [
    { key: "benefit", label: "Benefit" },
    { key: "fund", label: "Fund" },
    { key: "subLimitOf", label: "Sub limit of" },
    { key: "sharing", label: "Sharing" },
    { key: "waitingPeriod", label: "Waiting period" },
  ];

  const ints: Record<string, number | null> = {};
  for (const field of intFields) {
    const result = parseOptionalInt(group[field.key], field.label);
    if ("error" in result) {
      return {
        error: NextResponse.json(
          { error: `${rowLabel}: ${result.error}` },
          { status: 400 }
        ),
      };
    }
    ints[field.key] = result.value;
  }

  const decimalFields: { key: Exclude<keyof CategoryGroupInput, "idx">; label: string }[] = [
    { key: "policyLimit", label: "Limit" },
    { key: "copayAmount", label: "Copay amount" },
  ];

  const decimals: Record<string, number | null> = {};
  for (const field of decimalFields) {
    const result = parseOptionalDecimal(group[field.key], field.label);
    if ("error" in result) {
      return {
        error: NextResponse.json(
          { error: `${rowLabel}: ${result.error}` },
          { status: 400 }
        ),
      };
    }
    decimals[field.key] = result.value;
  }

  return {
    data: {
      idx:
        group.idx != null && group.idx !== ""
          ? Number(group.idx)
          : undefined,
      corpId,
      anniv: annivResult.value,
      category: trimOrNull(categoryResult.value, 10, true),
      benefit: ints.benefit,
      fund: ints.fund,
      policyLimit: decimals.policyLimit,
      subLimitOf: ints.subLimitOf,
      sharing: ints.sharing,
      copayAmount: decimals.copayAmount,
      waitingPeriod: ints.waitingPeriod,
    },
  };
}

export function buildCategoryGroupsData(
  categoryGroups: CategoryGroupInput[] | undefined,
  corporate: { corpId: string | null },
  defaultAnniv?: string
): BuildCategoryGroupsResult {
  if (!categoryGroups?.length) {
    return { data: [] };
  }

  const corpId = corporate.corpId?.trim();
  if (!corpId) {
    return {
      error: NextResponse.json(
        { error: "Corporate corp ID is missing" },
        { status: 500 }
      ),
    };
  }

  const rows: CategoryGroupSyncRow[] = [];
  const anniv = defaultAnniv ?? "1";

  for (const [index, group] of categoryGroups.entries()) {
    if (!hasCategoryGroupRowInput(group)) {
      continue;
    }

    const rowLabel = `Category row ${index + 1}`;
    const rowResult = buildCategoryGroupRowData(group, corpId, anniv, rowLabel);
    if ("error" in rowResult) {
      return rowResult;
    }

    rows.push(rowResult.data);
  }

  return { data: rows };
}

export function corpGroupToFormValues(group: {
  idx: number;
  anniv: Prisma.Decimal | null;
  category: string | null;
  benefit: number | null;
  fund: number | null;
  policyLimit: Prisma.Decimal | null;
  subLimitOf: number | null;
  sharing: number | null;
  copayAmount: Prisma.Decimal | null;
  waitingPeriod: number | null;
}): CategoryGroupFormData {
  const intToString = (value: number | null) =>
    value != null ? String(value) : "";

  return {
    idx: group.idx,
    anniv: decimalToString(group.anniv),
    category: group.category ?? "",
    benefit: intToString(group.benefit),
    fund: group.fund != null ? String(group.fund) : "0",
    policyLimit: decimalToString(group.policyLimit),
    subLimitOf: intToString(group.subLimitOf),
    sharing: intToString(group.sharing),
    copayAmount: decimalToString(group.copayAmount),
    waitingPeriod: intToString(group.waitingPeriod),
  };
}

type CorpGroupClient = Pick<Prisma.TransactionClient, "corpGroup">;

const managedCategoryGroupFields = {
  anniv: true,
  category: true,
  benefit: true,
  fund: true,
  policyLimit: true,
  subLimitOf: true,
  sharing: true,
  copayAmount: true,
  waitingPeriod: true,
} as const;

export async function syncCorpGroups(
  prisma: CorpGroupClient,
  corpId: string,
  rows: CategoryGroupSyncRow[]
) {
  const annivValues = rows
    .map((row) => row.anniv)
    .filter((anniv): anniv is number => anniv != null);
  const scopedAnniv = annivValues.length > 0 ? annivValues[0] : null;

  const existing = await prisma.corpGroup.findMany({
    where: {
      corpId,
      ...(scopedAnniv != null ? { anniv: scopedAnniv } : {}),
    },
    select: { idx: true },
  });

  const keepIdxs = rows
    .map((row) => row.idx)
    .filter((idx): idx is number => typeof idx === "number");

  const deleteIdxs = existing
    .map((row) => row.idx)
    .filter((idx) => !keepIdxs.includes(idx));

  if (deleteIdxs.length > 0) {
    await prisma.corpGroup.deleteMany({
      where: { idx: { in: deleteIdxs } },
    });
  }

  for (const row of rows) {
    const { idx, corpId: rowCorpId, ...data } = row;
    const managedData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key in managedCategoryGroupFields)
    ) as Omit<CategoryGroupSyncRow, "idx" | "corpId">;

    if (idx != null) {
      await prisma.corpGroup.update({
        where: { idx },
        data: managedData,
      });
      continue;
    }

    await prisma.corpGroup.create({
      data: {
        corpId: rowCorpId,
        ...managedData,
      },
    });
  }
}
