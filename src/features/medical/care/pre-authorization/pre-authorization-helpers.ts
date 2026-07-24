import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { formatThousands, stripThousands } from "@/lib/format";
import type { PreAuthorizationFormData, PreAuthorizationInput } from "./types";

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function parseRequiredString(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  return { value: trimmed };
}

function parseRequiredDecimal(value: string | undefined, label: string) {
  const trimmed = stripThousands(value);
  if (!trimmed) {
    return { error: `${label} is required` };
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return { error: `${label} must be a number` };
  }
  return { value: String(parsed) };
}

function parseOptionalDecimal(value: string | undefined, label: string) {
  const trimmed = stripThousands(value);
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

function formatDateValue(value: Date | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function decimalToString(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return "";
  return String(value);
}

function formatAmountString(
  value: Prisma.Decimal | number | string | null | undefined
) {
  if (value == null) return "";
  return formatThousands(String(value));
}

/** Returns an error message when date reported is outside the cover period. */
export function getDateReportedCoverPeriodError(
  dateReported: string | null | undefined,
  coverPeriod: { startDate?: string | null; endDate?: string | null } | null
) {
  const dateIso = dateReported?.trim();
  if (!dateIso) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
    return "Invalid date reported";
  }

  const startIso = coverPeriod?.startDate?.trim() || "";
  const endIso = coverPeriod?.endDate?.trim() || "";
  if (!startIso && !endIso) return null;

  if (startIso && dateIso < startIso) {
    return `Date reported must be on or after the cover start date (${startIso})`;
  }
  if (endIso && dateIso > endIso) {
    return `Date reported must be on or before the cover end date (${endIso})`;
  }
  return null;
}

export function buildPreAuthorizationData(body: PreAuthorizationInput) {
  const memberNoResult = parseRequiredString(body.memberNo, "Member no");
  if ("error" in memberNoResult) {
    return {
      error: NextResponse.json({ error: memberNoResult.error }, { status: 400 }),
    };
  }

  const providerResult = parseRequiredDecimal(body.provider, "Provider");
  if ("error" in providerResult) {
    return {
      error: NextResponse.json({ error: providerResult.error }, { status: 400 }),
    };
  }

  const decimalFields: {
    key: keyof PreAuthorizationFormData;
    label: string;
  }[] = [
    { key: "authorityType", label: "Authority type" },
    { key: "ward", label: "Ward" },
    { key: "availableLimit", label: "Available limit" },
    { key: "admitDays", label: "Admit days" },
    { key: "reserve", label: "Reserve" },
    { key: "anniv", label: "Anniv" },
    { key: "batchNo", label: "Batch no" },
    { key: "bedLimit", label: "Bed limit" },
  ];

  const decimals: Record<string, string | null> = {};
  for (const field of decimalFields) {
    const result = parseOptionalDecimal(body[field.key], field.label);
    if ("error" in result) {
      return {
        error: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    decimals[field.key] = result.value;
  }

  const dateReportedResult = parseOptionalDate(
    body.dateReported,
    "Date reported"
  );
  if ("error" in dateReportedResult) {
    return {
      error: NextResponse.json(
        { error: dateReportedResult.error },
        { status: 400 }
      ),
    };
  }

  const dateAuthorizedResult = parseOptionalDate(
    body.dateAuthorized,
    "Date authorized"
  );
  if ("error" in dateAuthorizedResult) {
    return {
      error: NextResponse.json(
        { error: dateAuthorizedResult.error },
        { status: 400 }
      ),
    };
  }

  const validityDateResult = parseOptionalDate(
    body.validityDate,
    "Validity date"
  );
  if ("error" in validityDateResult) {
    return {
      error: NextResponse.json(
        { error: validityDateResult.error },
        { status: 400 }
      ),
    };
  }

  return {
    data: {
      memberNo: memberNoResult.value,
      provider: providerResult.value,
      dateReported: dateReportedResult.value,
      reportedBy: trimOrNull(body.reportedBy)?.slice(0, 20) ?? null,
      dateAuthorized: dateAuthorizedResult.value,
      authorizedBy: trimOrNull(body.authorizedBy)?.slice(0, 10) ?? null,
      preDiagnosis: trimOrNull(body.preDiagnosis)?.slice(0, 60) ?? null,
      authorityType: decimals.authorityType,
      ward: decimals.ward,
      availableLimit: decimals.availableLimit,
      admitDays: decimals.admitDays,
      reserve: decimals.reserve,
      notes: trimOrNull(body.notes)?.slice(0, 255) ?? null,
      coSignee: trimOrNull(body.coSignee)?.slice(0, 30) ?? null,
      anniv: decimals.anniv,
      clinicalProcedure:
        trimOrNull(body.clinicalProcedure)?.slice(0, 100) ?? null,
      doctor1: trimOrNull(body.doctor1)?.slice(0, 100) ?? null,
      doctor2: trimOrNull(body.doctor2)?.slice(0, 100) ?? null,
      batchNo: decimals.batchNo,
      bedLimit: decimals.bedLimit,
      validityDate: validityDateResult.value,
      careNotes: trimOrNull(body.careNotes)?.slice(0, 255) ?? null,
    },
  };
}

export function preAuthorizationToFormValues(row: {
  memberNo: string;
  provider: Prisma.Decimal | number | string;
  dateReported: Date | string | null;
  reportedBy: string | null;
  dateAuthorized: Date | string | null;
  authorizedBy: string | null;
  preDiagnosis: string | null;
  authorityType: Prisma.Decimal | number | string | null;
  ward: Prisma.Decimal | number | string | null;
  availableLimit: Prisma.Decimal | number | string | null;
  admitDays: Prisma.Decimal | number | string | null;
  reserve: Prisma.Decimal | number | string | null;
  notes: string | null;
  coSignee: string | null;
  anniv: Prisma.Decimal | number | string | null;
  clinicalProcedure: string | null;
  doctor1: string | null;
  doctor2: string | null;
  batchNo: Prisma.Decimal | number | string | null;
  bedLimit: Prisma.Decimal | number | string | null;
  validityDate: Date | string | null;
  careNotes: string | null;
}): PreAuthorizationFormData {
  return {
    memberNo: row.memberNo,
    provider: decimalToString(row.provider),
    dateReported: formatDateValue(row.dateReported),
    reportedBy: row.reportedBy ?? "",
    dateAuthorized: formatDateValue(row.dateAuthorized),
    authorizedBy: row.authorizedBy ?? "",
    preDiagnosis: row.preDiagnosis ?? "",
    authorityType: decimalToString(row.authorityType),
    ward: decimalToString(row.ward),
    availableLimit: formatAmountString(row.availableLimit),
    admitDays: decimalToString(row.admitDays),
    reserve: formatAmountString(row.reserve),
    notes: row.notes ?? "",
    coSignee: row.coSignee ?? "",
    anniv: decimalToString(row.anniv),
    clinicalProcedure: row.clinicalProcedure ?? "",
    doctor1: row.doctor1 ?? "",
    doctor2: row.doctor2 ?? "",
    batchNo: decimalToString(row.batchNo),
    bedLimit: formatAmountString(row.bedLimit),
    validityDate: formatDateValue(row.validityDate),
    careNotes: row.careNotes ?? "",
  };
}
