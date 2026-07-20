import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { validateCoverDateOrder } from "@/features/medical/corporates/cover-date-helpers";
import type { MemberAnniversaryFormData } from "./member-anniversary-types";

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

export function hasMemberAnniversaryRowInput(
  row?: Partial<MemberAnniversaryFormData>
) {
  if (!row) return false;
  return Object.entries(row).some(([key, value]) => {
    if (key === "memberNo" || key === "anniv") return false;
    return Boolean(String(value ?? "").trim());
  });
}

export type MemberAnniversarySyncRow = {
  memberNo: string;
  anniv: number;
  startDate: Date | null;
  endDate: Date | null;
  renewalDate: Date | null;
  userId: string | null;
  dateEntered: Date | null;
  sync: number | null;
  renewalNotes: string | null;
  invoiceNo: string | null;
  commisRate: string | null;
  whtaxRate: string | null;
  sumInsured: string | null;
  statusUser: string | null;
  status: number | null;
  smartSync: number | null;
  branch: number | null;
  unitManager: number | null;
};

function buildMemberAnniversaryRowData(
  row: Partial<MemberAnniversaryFormData>,
  memberNo: string,
  rowLabel: string
): { data: MemberAnniversarySyncRow } | { error: NextResponse } {
  const annivResult = parseRequiredInt(row.anniv || "1", `${rowLabel} anniv`);
  if ("error" in annivResult) {
    return {
      error: NextResponse.json({ error: annivResult.error }, { status: 400 }),
    };
  }

  const dateOrderError = validateCoverDateOrder({
    startDate: row.startDate,
    endDate: row.endDate,
    renewalDate: row.renewalDate,
  });
  if (dateOrderError) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${dateOrderError}` },
        { status: 400 }
      ),
    };
  }

  const startDateResult = parseOptionalDate(
    row.startDate,
    `${rowLabel} start date`
  );
  if ("error" in startDateResult) {
    return {
      error: NextResponse.json({ error: startDateResult.error }, { status: 400 }),
    };
  }
  const endDateResult = parseOptionalDate(row.endDate, `${rowLabel} end date`);
  if ("error" in endDateResult) {
    return {
      error: NextResponse.json({ error: endDateResult.error }, { status: 400 }),
    };
  }
  const renewalDateResult = parseOptionalDate(
    row.renewalDate,
    `${rowLabel} renewal date`
  );
  if ("error" in renewalDateResult) {
    return {
      error: NextResponse.json(
        { error: renewalDateResult.error },
        { status: 400 }
      ),
    };
  }
  const dateEnteredResult = parseOptionalDate(
    row.dateEntered,
    `${rowLabel} date entered`
  );
  if ("error" in dateEnteredResult) {
    return {
      error: NextResponse.json(
        { error: dateEnteredResult.error },
        { status: 400 }
      ),
    };
  }

  const intFields: { key: keyof MemberAnniversaryFormData; label: string }[] = [
    { key: "sync", label: "Sync" },
    { key: "status", label: "Status" },
    { key: "smartSync", label: "Smart sync" },
    { key: "branch", label: "Branch" },
    { key: "unitManager", label: "Unit manager" },
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
    key: keyof MemberAnniversaryFormData;
    label: string;
  }[] = [
    { key: "commisRate", label: "Commission rate" },
    { key: "whtaxRate", label: "WH tax rate" },
    { key: "sumInsured", label: "Sum insured" },
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

  return {
    data: {
      memberNo,
      anniv: annivResult.value,
      startDate: startDateResult.value,
      endDate: endDateResult.value,
      renewalDate: renewalDateResult.value,
      userId: trimOrNull(row.userId),
      dateEntered: dateEnteredResult.value,
      sync: ints.sync,
      renewalNotes: trimOrNull(row.renewalNotes),
      invoiceNo: trimOrNull(row.invoiceNo),
      commisRate: decimals.commisRate,
      whtaxRate: decimals.whtaxRate,
      sumInsured: decimals.sumInsured,
      statusUser: trimOrNull(row.statusUser),
      status: ints.status,
      smartSync: ints.smartSync,
      branch: ints.branch,
      unitManager: ints.unitManager,
    },
  };
}

export function buildMemberAnniversariesData(
  rows: Partial<MemberAnniversaryFormData>[] | undefined,
  memberNo: string
):
  | { data: MemberAnniversarySyncRow[] }
  | { error: NextResponse }
  | { data: null } {
  if (rows === undefined) {
    return { data: null };
  }

  if (!memberNo.trim()) {
    const hasRows = rows.some((row) => hasMemberAnniversaryRowInput(row));
    if (hasRows) {
      return {
        error: NextResponse.json(
          { error: "Member number is required for cover history" },
          { status: 400 }
        ),
      };
    }
    return { data: [] };
  }

  const syncRows: MemberAnniversarySyncRow[] = [];
  const seen = new Set<number>();

  for (const [index, row] of rows.entries()) {
    if (!hasMemberAnniversaryRowInput(row) && !String(row.anniv ?? "").trim()) {
      continue;
    }
    if (!hasMemberAnniversaryRowInput(row)) {
      continue;
    }

    const rowLabel = `Cover history row ${index + 1}`;
    const rowResult = buildMemberAnniversaryRowData(row, memberNo, rowLabel);
    if ("error" in rowResult) {
      return rowResult;
    }

    if (seen.has(rowResult.data.anniv)) {
      return {
        error: NextResponse.json(
          { error: `${rowLabel}: duplicate anniv` },
          { status: 400 }
        ),
      };
    }
    seen.add(rowResult.data.anniv);
    syncRows.push(rowResult.data);
  }

  return { data: syncRows };
}

export function memberAnniversaryToFormValues(row: {
  memberNo: string;
  anniv: number;
  startDate: Date | string | null;
  endDate: Date | string | null;
  renewalDate: Date | string | null;
  userId: string | null;
  dateEntered: Date | string | null;
  sync: number | null;
  renewalNotes: string | null;
  invoiceNo: string | null;
  commisRate: { toString(): string } | string | null;
  whtaxRate: { toString(): string } | string | null;
  sumInsured: { toString(): string } | string | null;
  statusUser: string | null;
  status: number | null;
  smartSync: number | null;
  branch: number | null;
  unitManager: number | null;
}): MemberAnniversaryFormData {
  return {
    memberNo: row.memberNo,
    anniv: intToString(row.anniv) || "1",
    startDate: formatDateValue(row.startDate),
    endDate: formatDateValue(row.endDate),
    renewalDate: formatDateValue(row.renewalDate),
    userId: row.userId ?? "",
    dateEntered: formatDateValue(row.dateEntered),
    sync: intToString(row.sync),
    renewalNotes: row.renewalNotes ?? "",
    invoiceNo: row.invoiceNo ?? "",
    commisRate: decimalToString(row.commisRate),
    whtaxRate: decimalToString(row.whtaxRate),
    sumInsured: decimalToString(row.sumInsured),
    statusUser: row.statusUser ?? "",
    status: intToString(row.status),
    smartSync: intToString(row.smartSync),
    branch: intToString(row.branch),
    unitManager: intToString(row.unitManager),
  };
}

export function applyAnniversaryDateFieldChange(
  row: MemberAnniversaryFormData,
  name: string,
  value: string
): MemberAnniversaryFormData {
  // End / renewal dates come from the corporate's latest anniversary and are
  // locked in the form — only start / anniv / other editable fields update here.
  return { ...row, [name]: value };
}

type MemberAnniversaryClient = {
  memberAnniversary: {
    findMany: (args: {
      where: { memberNo: string };
      select: { memberNo: true; anniv: true };
    }) => Promise<Array<{ memberNo: string; anniv: number }>>;
    deleteMany: (args: {
      where: { memberNo: string; anniv: { in: number[] } };
    }) => Promise<unknown>;
    upsert: (args: {
      where: {
        memberNo_anniv: { memberNo: string; anniv: number };
      };
      create: Prisma.MemberAnniversaryUncheckedCreateInput;
      update: Prisma.MemberAnniversaryUncheckedUpdateInput;
    }) => Promise<unknown>;
  };
};

export async function syncMemberAnniversaries(
  prisma: MemberAnniversaryClient,
  memberNo: string,
  rows: MemberAnniversarySyncRow[]
) {
  const existing = await prisma.memberAnniversary.findMany({
    where: { memberNo },
    select: { memberNo: true, anniv: true },
  });

  const keepAnnivs = new Set(rows.map((row) => row.anniv));
  const deleteAnnivs = existing
    .map((row) => row.anniv)
    .filter((anniv) => !keepAnnivs.has(anniv));

  if (deleteAnnivs.length > 0) {
    await prisma.memberAnniversary.deleteMany({
      where: { memberNo, anniv: { in: deleteAnnivs } },
    });
  }

  for (const row of rows) {
    const { memberNo: rowMemberNo, anniv, ...data } = row;
    await prisma.memberAnniversary.upsert({
      where: {
        memberNo_anniv: {
          memberNo: rowMemberNo,
          anniv,
        },
      },
      create: {
        memberNo: rowMemberNo,
        anniv,
        ...data,
      },
      update: data,
    });
  }
}
