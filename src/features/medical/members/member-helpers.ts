import { NextResponse } from "next/server";
import type { MemberFormData, MemberInput } from "./types";

const MEMBER_TYPES = new Set(["PRINCIPAL", "DEPENDANT"]);
const MEMBER_STATUSES = new Set(["ACTIVE", "INACTIVE", "PENDING"]);

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function parseDateOfBirth(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildMemberData(body: MemberInput) {
  if (!body.memberNumber?.trim()) {
    return {
      error: NextResponse.json({ error: "Member number is required" }, { status: 400 }),
    };
  }
  if (!body.firstName?.trim()) {
    return {
      error: NextResponse.json({ error: "First name is required" }, { status: 400 }),
    };
  }
  if (!body.lastName?.trim()) {
    return {
      error: NextResponse.json({ error: "Last name is required" }, { status: 400 }),
    };
  }
  if (!body.corporateId?.trim()) {
    return {
      error: NextResponse.json({ error: "Corporate is required" }, { status: 400 }),
    };
  }

  const memberType = body.memberType?.trim() || "PRINCIPAL";
  if (!MEMBER_TYPES.has(memberType)) {
    return {
      error: NextResponse.json({ error: "Invalid member type" }, { status: 400 }),
    };
  }

  const status = body.status?.trim() || "ACTIVE";
  if (!MEMBER_STATUSES.has(status)) {
    return {
      error: NextResponse.json({ error: "Invalid member status" }, { status: 400 }),
    };
  }

  const principalId = trimOrNull(body.principalId);
  if (memberType === "DEPENDANT" && !principalId) {
    return {
      error: NextResponse.json({ error: "Principal is required for dependants" }, { status: 400 }),
    };
  }

  return {
    data: {
      memberNumber: body.memberNumber.trim(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      corporateId: body.corporateId.trim(),
      memberType: memberType as "PRINCIPAL" | "DEPENDANT",
      principalId: memberType === "DEPENDANT" ? principalId : null,
      email: trimOrNull(body.email),
      phone: trimOrNull(body.phone),
      status: status as "ACTIVE" | "INACTIVE" | "PENDING",
      dateOfBirth: parseDateOfBirth(body.dateOfBirth),
    },
  };
}

export function buildMemberStatusData(body: { status?: string }) {
  const status = body.status?.trim();
  if (!status || !MEMBER_STATUSES.has(status)) {
    return {
      error: NextResponse.json({ error: "Invalid member status" }, { status: 400 }),
    };
  }

  return {
    data: {
      status: status as "ACTIVE" | "INACTIVE" | "PENDING",
    },
  };
}

export function memberToFormValues(member: {
  memberNumber: string;
  firstName: string;
  lastName: string;
  corporateId: string;
  memberType: string;
  principalId: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  dateOfBirth: Date | string | null;
}): MemberFormData {
  return {
    memberNumber: member.memberNumber,
    firstName: member.firstName,
    lastName: member.lastName,
    corporateId: member.corporateId,
    memberType: member.memberType,
    principalId: member.principalId ?? "",
    email: member.email ?? "",
    phone: member.phone ?? "",
    status: member.status,
    dateOfBirth: formatDateOfBirth(member.dateOfBirth),
  };
}

function formatDateOfBirth(value: Date | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
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
