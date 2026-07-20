import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { MemberAcceptanceFormData } from "./member-acceptance-types";

function trimOrNull(value?: string | null, maxLength?: number) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (maxLength != null && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}

function parseRequiredStatus(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return { error: "Status is required" };
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 9) {
    return { error: "Status must be a whole number between 0 and 9" };
  }
  return { value: String(parsed) };
}

function parseOptionalInt(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as number | null };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return { error: `${label} must be a valid defer / reject reason` };
  }
  return { value: parsed };
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

function formatDecimal(value: { toString(): string } | string | null | undefined) {
  return value != null ? String(value) : "";
}

export function buildMemberAcceptanceData(
  body: Partial<MemberAcceptanceFormData> | undefined,
  memberNoFallback?: string
) {
  if (!body) {
    return { data: null };
  }

  const memberNo = body.memberNo?.trim() || memberNoFallback?.trim() || "";
  const hasAnyValue = Object.entries(body).some(([key, value]) => {
    if (key === "memberNo") return false;
    return Boolean(String(value ?? "").trim());
  });

  if (!hasAnyValue) {
    return { data: null };
  }

  if (!memberNo) {
    return {
      error: NextResponse.json(
        { error: "Member number is required for acceptance" },
        { status: 400 }
      ),
    };
  }

  const statusResult = parseRequiredStatus(body.status);
  if ("error" in statusResult) {
    return {
      error: NextResponse.json({ error: statusResult.error }, { status: 400 }),
    };
  }

  const statusDateResult = parseOptionalDate(body.statusDate, "Status date");
  if ("error" in statusDateResult) {
    return {
      error: NextResponse.json(
        { error: statusDateResult.error },
        { status: 400 }
      ),
    };
  }

  const dateEnteredResult = parseOptionalDate(body.dateEntered, "Date entered");
  if ("error" in dateEnteredResult) {
    return {
      error: NextResponse.json(
        { error: dateEnteredResult.error },
        { status: 400 }
      ),
    };
  }

  const defRejResult = parseOptionalInt(body.defRej, "Def / rej");
  if ("error" in defRejResult) {
    return {
      error: NextResponse.json({ error: defRejResult.error }, { status: 400 }),
    };
  }

  return {
    data: {
      memberNo,
      status: statusResult.value,
      statusDate: statusDateResult.value,
      comments: trimOrNull(body.comments, 70),
      userId: trimOrNull(body.userId, 10),
      dateEntered: dateEnteredResult.value,
      defRej: defRejResult.value,
    } satisfies Prisma.MemberAcceptanceUncheckedCreateInput,
  };
}

export function memberAcceptanceToFormValues(row: {
  memberNo: string;
  status: { toString(): string } | string;
  statusDate: Date | string | null;
  comments: string | null;
  userId: string | null;
  dateEntered: Date | string | null;
  defRej: number | null;
}): MemberAcceptanceFormData {
  return {
    memberNo: row.memberNo,
    status: formatDecimal(row.status),
    statusDate: formatDateValue(row.statusDate),
    comments: row.comments ?? "",
    userId: row.userId ?? "",
    dateEntered: formatDateValue(row.dateEntered),
    defRej: row.defRej != null ? String(row.defRej) : "",
  };
}

export async function upsertMemberAcceptance(
  prisma: {
    memberAcceptance: {
      findUnique: (args: {
        where: { memberNo: string };
      }) => Promise<{ memberNo: string } | null>;
      create: (args: {
        data: Prisma.MemberAcceptanceUncheckedCreateInput;
      }) => Promise<unknown>;
      update: (args: {
        where: { memberNo: string };
        data: Prisma.MemberAcceptanceUncheckedUpdateInput;
      }) => Promise<unknown>;
    };
  },
  data: Prisma.MemberAcceptanceUncheckedCreateInput
) {
  const existing = await prisma.memberAcceptance.findUnique({
    where: { memberNo: data.memberNo },
  });

  if (existing) {
    const { memberNo: _memberNo, ...updateData } = data;
    return prisma.memberAcceptance.update({
      where: { memberNo: data.memberNo },
      data: updateData,
    });
  }

  return prisma.memberAcceptance.create({ data });
}
