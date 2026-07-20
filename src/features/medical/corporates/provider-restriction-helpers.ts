import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type {
  ProviderRestrictionFormData,
  ProviderRestrictionInput,
} from "./types";

function parseRequiredProvider(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: "Provider is required" };
  }
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
    return { error: "Provider must be a whole number" };
  }
  if (Math.abs(parsed) > 99999) {
    return { error: "Provider must be at most 5 digits" };
  }
  return { value: parsed };
}

function parseOptionalAnniv(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null };
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return { error: "Anniv must be a number" };
  }
  return { value: parsed };
}

export function hasProviderRestrictionRowInput(
  row?: ProviderRestrictionInput
) {
  if (!row) return false;
  return Boolean(row.provider?.trim());
}

type ProviderRestrictionSyncRow = {
  idx?: number;
  corpId: string;
  provider: number;
  anniv: number | null;
};

type BuildProviderRestrictionsResult =
  | { data: ProviderRestrictionSyncRow[] }
  | { error: NextResponse };

function buildProviderRestrictionRowData(
  row: ProviderRestrictionInput,
  corpId: string,
  defaultAnniv: string,
  rowLabel: string
): { data: ProviderRestrictionSyncRow } | { error: NextResponse } {
  const providerResult = parseRequiredProvider(row.provider);
  if ("error" in providerResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${providerResult.error}` },
        { status: 400 }
      ),
    };
  }

  const annivValue = row.anniv?.trim() || defaultAnniv.trim() || "1";
  const annivResult = parseOptionalAnniv(annivValue);
  if ("error" in annivResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${annivResult.error}` },
        { status: 400 }
      ),
    };
  }

  return {
    data: {
      idx:
        row.idx != null && row.idx !== ""
          ? Number(row.idx)
          : undefined,
      corpId,
      provider: providerResult.value,
      anniv: annivResult.value,
    },
  };
}

export function buildProviderRestrictionsData(
  providerRestrictions: ProviderRestrictionInput[] | undefined,
  corporate: { corpId: string | null },
  defaultAnniv?: string
): BuildProviderRestrictionsResult {
  if (!providerRestrictions?.length) {
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

  const rows: ProviderRestrictionSyncRow[] = [];
  const anniv = defaultAnniv ?? "1";

  for (const [index, row] of providerRestrictions.entries()) {
    if (!hasProviderRestrictionRowInput(row)) {
      continue;
    }

    const rowLabel = `Provider restriction row ${index + 1}`;
    const rowResult = buildProviderRestrictionRowData(row, corpId, anniv, rowLabel);
    if ("error" in rowResult) {
      return rowResult;
    }

    rows.push(rowResult.data);
  }

  return { data: rows };
}

export function corpProviderToFormValues(row: {
  idx: number;
  provider: Prisma.Decimal | number;
  anniv: Prisma.Decimal | number | null;
}): ProviderRestrictionFormData {
  return {
    idx: row.idx,
    provider: String(Number(row.provider)),
    anniv: row.anniv != null ? String(Number(row.anniv)) : "",
  };
}

type CorpProviderClient = Pick<Prisma.TransactionClient, "corpProvider">;

const managedProviderFields = {
  provider: true,
  anniv: true,
} as const;

export async function syncCorpProviders(
  prisma: CorpProviderClient,
  corpId: string,
  rows: ProviderRestrictionSyncRow[]
) {
  const annivValues = rows
    .map((row) => row.anniv)
    .filter((anniv): anniv is number => anniv != null);
  const scopedAnniv = annivValues.length > 0 ? annivValues[0] : null;

  const existing = await prisma.corpProvider.findMany({
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
    await prisma.corpProvider.deleteMany({
      where: { idx: { in: deleteIdxs } },
    });
  }

  for (const row of rows) {
    const { idx, corpId: rowCorpId, ...data } = row;
    const managedData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key in managedProviderFields)
    ) as Omit<ProviderRestrictionSyncRow, "idx" | "corpId">;

    if (idx != null) {
      await prisma.corpProvider.update({
        where: { idx },
        data: managedData,
      });
      continue;
    }

    await prisma.corpProvider.create({
      data: {
        corpId: rowCorpId,
        ...managedData,
      },
    });
  }
}
