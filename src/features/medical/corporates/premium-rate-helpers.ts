import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { PremiumRateFormData, PremiumRateInput } from "./types";

function parseRequiredNumber(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { error: `${label} must be a number` };
  }
  return { value: parsed };
}

function parseOptionalNumber(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null };
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { error: `${label} must be a number` };
  }
  return { value: parsed };
}

function decimalToString(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return "";
  return String(value);
}

export function hasPremiumRateRowInput(row?: PremiumRateInput) {
  if (!row) return false;
  return Boolean(
    row.benefit?.trim() ||
      row.premiumType?.trim() ||
      row.familySize?.trim() ||
      row.policyLimit?.trim() ||
      row.premium?.trim() ||
      row.minAge?.trim() ||
      row.maxAge?.trim()
  );
}

type PremiumRateSyncRow = {
  idx?: number;
  corpId: string;
  benefit: number;
  premiumType: number | null;
  familySize: number | null;
  policyLimit: number | null;
  premium: number | null;
  minAge: number | null;
  maxAge: number | null;
};

type BuildPremiumRatesResult =
  | { data: PremiumRateSyncRow[] }
  | { error: NextResponse };

function buildPremiumRateRowData(
  row: PremiumRateInput,
  corpId: string,
  rowLabel: string
): { data: PremiumRateSyncRow } | { error: NextResponse } {
  const benefitResult = parseRequiredNumber(row.benefit, "Benefit");
  if ("error" in benefitResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${benefitResult.error}` },
        { status: 400 }
      ),
    };
  }

  const numberFields: {
    key: Exclude<keyof PremiumRateInput, "idx" | "benefit">;
    label: string;
  }[] = [
    { key: "premiumType", label: "Premium type" },
    { key: "familySize", label: "Family size" },
    { key: "policyLimit", label: "Limit" },
    { key: "premium", label: "Premium" },
    { key: "minAge", label: "Min age" },
    { key: "maxAge", label: "Max age" },
  ];

  const numbers: Record<string, number | null> = {};
  for (const field of numberFields) {
    const result = parseOptionalNumber(row[field.key], field.label);
    if ("error" in result) {
      return {
        error: NextResponse.json(
          { error: `${rowLabel}: ${result.error}` },
          { status: 400 }
        ),
      };
    }
    numbers[field.key] = result.value;
  }

  return {
    data: {
      idx:
        row.idx != null && row.idx !== ""
          ? Number(row.idx)
          : undefined,
      corpId,
      benefit: benefitResult.value,
      premiumType: numbers.premiumType,
      familySize: numbers.familySize,
      policyLimit: numbers.policyLimit,
      premium: numbers.premium,
      minAge: numbers.minAge,
      maxAge: numbers.maxAge,
    },
  };
}

export function buildPremiumRatesData(
  premiumRates: PremiumRateInput[] | undefined,
  corporate: { corpId: string | null }
): BuildPremiumRatesResult {
  if (!premiumRates?.length) {
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

  const rows: PremiumRateSyncRow[] = [];

  for (const [index, row] of premiumRates.entries()) {
    if (!hasPremiumRateRowInput(row)) {
      continue;
    }

    const rowLabel = `Premium rate row ${index + 1}`;
    const rowResult = buildPremiumRateRowData(row, corpId, rowLabel);
    if ("error" in rowResult) {
      return rowResult;
    }

    rows.push(rowResult.data);
  }

  return { data: rows };
}

export function clientRateToFormValues(row: {
  idx: number;
  benefit: Prisma.Decimal | number;
  premiumType: Prisma.Decimal | number | null;
  familySize: Prisma.Decimal | number | null;
  policyLimit: Prisma.Decimal | number | null;
  premium: Prisma.Decimal | number | null;
  minAge: Prisma.Decimal | number | null;
  maxAge: Prisma.Decimal | number | null;
}): PremiumRateFormData {
  return {
    idx: row.idx,
    benefit: decimalToString(row.benefit),
    premiumType: decimalToString(row.premiumType),
    familySize: decimalToString(row.familySize),
    policyLimit: decimalToString(row.policyLimit),
    premium: decimalToString(row.premium),
    minAge: decimalToString(row.minAge),
    maxAge: decimalToString(row.maxAge),
  };
}

type ClientRateClient = Pick<Prisma.TransactionClient, "clientRate">;

const managedPremiumRateFields = {
  benefit: true,
  premiumType: true,
  familySize: true,
  policyLimit: true,
  premium: true,
  minAge: true,
  maxAge: true,
} as const;

export async function syncClientRates(
  prisma: ClientRateClient,
  corpId: string,
  rows: PremiumRateSyncRow[]
) {
  const existing = await prisma.clientRate.findMany({
    where: { corpId },
    select: { idx: true },
  });

  const keepIdxs = rows
    .map((row) => row.idx)
    .filter((idx): idx is number => typeof idx === "number");

  const deleteIdxs = existing
    .map((row) => row.idx)
    .filter((idx) => !keepIdxs.includes(idx));

  if (deleteIdxs.length > 0) {
    await prisma.clientRate.deleteMany({
      where: { idx: { in: deleteIdxs } },
    });
  }

  for (const row of rows) {
    const { idx, corpId: rowCorpId, ...data } = row;
    const managedData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key in managedPremiumRateFields)
    ) as Omit<PremiumRateSyncRow, "idx" | "corpId">;

    if (idx != null) {
      await prisma.clientRate.update({
        where: { idx },
        data: managedData,
      });
      continue;
    }

    await prisma.clientRate.create({
      data: {
        corpId: rowCorpId,
        ...managedData,
      },
    });
  }
}
