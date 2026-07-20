import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { MemberBenefitFormData } from "./member-benefits-types";

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function intToString(value: number | null | undefined) {
  return value != null ? String(value) : "";
}

function decimalToString(
  value: { toString(): string } | string | null | undefined
) {
  return value != null ? String(value) : "";
}

function formatDateValue(value: Date | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime())
      ? ""
      : parsed.toISOString().slice(0, 10);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return "";
}

function parseOptionalInt(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as number | null };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return { error: `${label} must be a whole number` };
  }
  return { value: parsed };
}

function parseRequiredInt(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return { error: `${label} must be a whole number` };
  }
  return { value: parsed };
}

function parseOptionalDecimal(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as string | null };
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { error: `${label} must be a number` };
  }
  return { value: String(parsed) };
}

function parseOptionalDate(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as Date | null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return { error: `Invalid ${label.toLowerCase()}` };
  }
  return { value: date };
}

export function hasMemberBenefitRowInput(row?: Partial<MemberBenefitFormData>) {
  if (!row) return false;
  return Object.entries(row).some(([key, value]) => {
    if (key === "memberNo" || key === "anniv" || key === "corpId" || key === "fund") {
      return false;
    }
    return Boolean(String(value ?? "").trim());
  });
}

export type MemberBenefitSyncRow = {
  memberNo: string;
  benefit: number;
  anniv: number;
  policyLimit: string | null;
  sharing: number | null;
  reInsurer: number | null;
  subLimitOf: number | null;
  suspended: number | null;
  suspendedDate: Date | null;
  suspendReason: number | null;
  suspendUser: string | null;
  suspendedEntry: Date | null;
  expense: string | null;
  balance: string | null;
  percent: string | null;
  status: string | null;
  reserve: string | null;
  claims: string | null;
  fund: number | null;
  cap: string | null;
  copayAmount: string | null;
  corpId: string | null;
  changeFactor: string | null;
  ceiling: number | null;
  changeLimit: string | null;
  statusUser: string | null;
  verifyStatus: number | null;
  waitingPeriod: number | null;
  bedLimit: string | null;
  sync: number | null;
  allocateTo: number | null;
};

function buildMemberBenefitRowData(
  row: Partial<MemberBenefitFormData>,
  memberNo: string,
  corpIdFallback: string | undefined,
  rowLabel: string
): { data: MemberBenefitSyncRow } | { error: NextResponse } {
  const benefitResult = parseRequiredInt(row.benefit, `${rowLabel} benefit`);
  if ("error" in benefitResult) {
    return {
      error: NextResponse.json({ error: benefitResult.error }, { status: 400 }),
    };
  }

  const annivResult = parseRequiredInt(row.anniv || "1", `${rowLabel} anniv`);
  if ("error" in annivResult) {
    return {
      error: NextResponse.json({ error: annivResult.error }, { status: 400 }),
    };
  }

  const intFields: {
    key: keyof MemberBenefitFormData;
    label: string;
  }[] = [
    { key: "sharing", label: "Sharing" },
    { key: "reInsurer", label: "Re-insurer" },
    { key: "subLimitOf", label: "Sub limit of" },
    { key: "suspended", label: "Suspended" },
    { key: "suspendReason", label: "Suspend reason" },
    { key: "fund", label: "Fund" },
    { key: "ceiling", label: "Ceiling" },
    { key: "verifyStatus", label: "Verify status" },
    { key: "waitingPeriod", label: "Waiting period" },
    { key: "sync", label: "Sync" },
    { key: "allocateTo", label: "Allocate to" },
  ];

  const ints: Record<string, number | null> = {};
  for (const field of intFields) {
    const result = parseOptionalInt(row[field.key], `${rowLabel} ${field.label}`);
    if ("error" in result) {
      return {
        error: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    ints[field.key] = result.value;
  }

  const decimalFields: {
    key: keyof MemberBenefitFormData;
    label: string;
  }[] = [
    { key: "policyLimit", label: "Limit" },
    { key: "bedLimit", label: "Bed limit" },
    { key: "expense", label: "Expense" },
    { key: "balance", label: "Balance" },
    { key: "percent", label: "Percent" },
    { key: "reserve", label: "Reserve" },
    { key: "claims", label: "Claims" },
    { key: "cap", label: "Cap" },
    { key: "copayAmount", label: "Copay amount" },
    { key: "changeFactor", label: "Change factor" },
    { key: "changeLimit", label: "Change limit" },
  ];

  const decimals: Record<string, string | null> = {};
  for (const field of decimalFields) {
    const result = parseOptionalDecimal(
      row[field.key],
      `${rowLabel} ${field.label}`
    );
    if ("error" in result) {
      return {
        error: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    decimals[field.key] = result.value;
  }

  const suspendedDateResult = parseOptionalDate(
    row.suspendedDate,
    `${rowLabel} suspended date`
  );
  if ("error" in suspendedDateResult) {
    return {
      error: NextResponse.json(
        { error: suspendedDateResult.error },
        { status: 400 }
      ),
    };
  }

  const suspendedEntryResult = parseOptionalDate(
    row.suspendedEntry,
    `${rowLabel} suspended entry`
  );
  if ("error" in suspendedEntryResult) {
    return {
      error: NextResponse.json(
        { error: suspendedEntryResult.error },
        { status: 400 }
      ),
    };
  }

  return {
    data: {
      memberNo,
      benefit: benefitResult.value,
      anniv: annivResult.value,
      policyLimit: decimals.policyLimit,
      sharing: ints.sharing,
      reInsurer: ints.reInsurer,
      subLimitOf: ints.subLimitOf,
      suspended: ints.suspended,
      suspendedDate: suspendedDateResult.value,
      suspendReason: ints.suspendReason,
      suspendUser: trimOrNull(row.suspendUser),
      suspendedEntry: suspendedEntryResult.value,
      expense: decimals.expense,
      balance: decimals.balance,
      percent: decimals.percent,
      status: trimOrNull(row.status),
      reserve: decimals.reserve,
      claims: decimals.claims,
      fund: ints.fund,
      cap: decimals.cap,
      copayAmount: decimals.copayAmount,
      corpId: trimOrNull(row.corpId) || trimOrNull(corpIdFallback),
      changeFactor: decimals.changeFactor,
      ceiling: ints.ceiling,
      changeLimit: decimals.changeLimit,
      statusUser: trimOrNull(row.statusUser),
      verifyStatus: ints.verifyStatus,
      waitingPeriod: ints.waitingPeriod,
      bedLimit: decimals.bedLimit,
      sync: ints.sync,
      allocateTo: ints.allocateTo,
    },
  };
}

export function buildMemberBenefitsData(
  benefits: Partial<MemberBenefitFormData>[] | undefined,
  memberNo: string,
  corpIdFallback?: string
): { data: MemberBenefitSyncRow[] } | { error: NextResponse } | { data: null } {
  if (benefits === undefined) {
    return { data: null };
  }

  if (!memberNo.trim()) {
    const hasRows = benefits.some((row) => hasMemberBenefitRowInput(row));
    if (hasRows) {
      return {
        error: NextResponse.json(
          { error: "Member number is required for benefits" },
          { status: 400 }
        ),
      };
    }
    return { data: [] };
  }

  const rows: MemberBenefitSyncRow[] = [];
  const seen = new Set<string>();

  for (const [index, row] of benefits.entries()) {
    if (!hasMemberBenefitRowInput(row) && !row.benefit?.trim()) {
      continue;
    }

    const rowLabel = `Benefit row ${index + 1}`;
    const rowResult = buildMemberBenefitRowData(
      row,
      memberNo,
      corpIdFallback,
      rowLabel
    );
    if ("error" in rowResult) {
      return rowResult;
    }

    const key = `${rowResult.data.benefit}:${rowResult.data.anniv}`;
    if (seen.has(key)) {
      return {
        error: NextResponse.json(
          {
            error: `${rowLabel}: duplicate benefit and anniv combination`,
          },
          { status: 400 }
        ),
      };
    }
    seen.add(key);
    rows.push(rowResult.data);
  }

  return { data: rows };
}

export function memberBenefitToFormValues(row: {
  memberNo: string;
  benefit: number;
  anniv: number;
  policyLimit: { toString(): string } | string | null;
  sharing: number | null;
  reInsurer: number | null;
  subLimitOf: number | null;
  suspended: number | null;
  suspendedDate: Date | string | null;
  suspendReason: number | null;
  suspendUser: string | null;
  suspendedEntry: Date | string | null;
  expense: { toString(): string } | string | null;
  balance: { toString(): string } | string | null;
  percent: { toString(): string } | string | null;
  status: string | null;
  reserve: { toString(): string } | string | null;
  claims: { toString(): string } | string | null;
  fund: number | null;
  cap: { toString(): string } | string | null;
  copayAmount: { toString(): string } | string | null;
  corpId: string | null;
  changeFactor: { toString(): string } | string | null;
  ceiling: number | null;
  changeLimit: { toString(): string } | string | null;
  statusUser: string | null;
  verifyStatus: number | null;
  waitingPeriod: number | null;
  bedLimit: { toString(): string } | string | null;
  sync: number | null;
  allocateTo: number | null;
}): MemberBenefitFormData {
  return {
    memberNo: row.memberNo,
    benefit: intToString(row.benefit),
    anniv: intToString(row.anniv) || "1",
    policyLimit: decimalToString(row.policyLimit),
    sharing: intToString(row.sharing),
    reInsurer: intToString(row.reInsurer),
    subLimitOf: intToString(row.subLimitOf),
    suspended: intToString(row.suspended),
    suspendedDate: formatDateValue(row.suspendedDate),
    suspendReason: intToString(row.suspendReason),
    suspendUser: row.suspendUser ?? "",
    suspendedEntry: formatDateValue(row.suspendedEntry),
    expense: decimalToString(row.expense),
    balance: decimalToString(row.balance),
    percent: decimalToString(row.percent),
    status: row.status ?? "",
    reserve: decimalToString(row.reserve),
    claims: decimalToString(row.claims),
    fund: intToString(row.fund) || "0",
    cap: decimalToString(row.cap),
    copayAmount: decimalToString(row.copayAmount),
    corpId: row.corpId ?? "",
    changeFactor: decimalToString(row.changeFactor),
    ceiling: intToString(row.ceiling),
    changeLimit: decimalToString(row.changeLimit),
    statusUser: row.statusUser ?? "",
    verifyStatus: intToString(row.verifyStatus),
    waitingPeriod: intToString(row.waitingPeriod),
    bedLimit: decimalToString(row.bedLimit),
    sync: intToString(row.sync),
    allocateTo: intToString(row.allocateTo),
  };
}

type MemberBenefitClient = {
  memberBenefit: {
    findMany: (args: {
      where: { memberNo: string };
      select: { memberNo: true; benefit: true; anniv: true };
    }) => Promise<Array<{ memberNo: string; benefit: number; anniv: number }>>;
    deleteMany: (args: {
      where: {
        memberNo: string;
        OR: Array<{ benefit: number; anniv: number }>;
      };
    }) => Promise<unknown>;
    upsert: (args: {
      where: {
        memberNo_benefit_anniv: {
          memberNo: string;
          benefit: number;
          anniv: number;
        };
      };
      create: Prisma.MemberBenefitUncheckedCreateInput;
      update: Prisma.MemberBenefitUncheckedUpdateInput;
    }) => Promise<unknown>;
  };
};

export async function syncMemberBenefits(
  prisma: MemberBenefitClient,
  memberNo: string,
  rows: MemberBenefitSyncRow[]
) {
  const existing = await prisma.memberBenefit.findMany({
    where: { memberNo },
    select: { memberNo: true, benefit: true, anniv: true },
  });

  const keepKeys = new Set(rows.map((row) => `${row.benefit}:${row.anniv}`));
  const deleteKeys = existing.filter(
    (row) => !keepKeys.has(`${row.benefit}:${row.anniv}`)
  );

  if (deleteKeys.length > 0) {
    await prisma.memberBenefit.deleteMany({
      where: {
        memberNo,
        OR: deleteKeys.map((row) => ({
          benefit: row.benefit,
          anniv: row.anniv,
        })),
      },
    });
  }

  for (const row of rows) {
    const { memberNo: rowMemberNo, benefit, anniv, ...data } = row;
    await prisma.memberBenefit.upsert({
      where: {
        memberNo_benefit_anniv: {
          memberNo: rowMemberNo,
          benefit,
          anniv,
        },
      },
      create: {
        memberNo: rowMemberNo,
        benefit,
        anniv,
        ...data,
      },
      update: data,
    });
  }
}
