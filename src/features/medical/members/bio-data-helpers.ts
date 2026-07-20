import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { BioDataFormData } from "./bio-data-types";

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function intToString(value: number | null | undefined) {
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

function parseOptionalFamilyRelationship(
  value: string | undefined,
  label: string
) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as number | null };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return { error: `${label} must be a valid family relationship` };
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

export function buildMemberInfoData(
  body: Partial<BioDataFormData> | undefined,
  memberNoFallback?: string,
  familyNoFallback?: string,
  corpIdFallback?: string
) {
  if (!body) {
    return { data: null };
  }

  const memberNo = body.memberNo?.trim() || memberNoFallback?.trim() || "";
  const familyNo = body.familyNo?.trim() || familyNoFallback?.trim() || "";

  const hasAnyValue = Object.entries(body).some(([key, value]) => {
    if (key === "memberNo" || key === "familyNo" || key === "corpId") {
      return false;
    }
    return Boolean(String(value ?? "").trim());
  });

  if (!hasAnyValue) {
    return { data: null };
  }

  if (!memberNo) {
    return {
      error: NextResponse.json(
        { error: "Member number is required for bio data" },
        { status: 400 }
      ),
    };
  }
  if (!familyNo) {
    return {
      error: NextResponse.json(
        { error: "Family number is required for bio data" },
        { status: 400 }
      ),
    };
  }

  const intFields: { key: keyof BioDataFormData; label: string }[] = [
    { key: "occupation", label: "Occupation" },
    { key: "bloodGroup", label: "Blood group" },
    { key: "cancelled", label: "Cancelled" },
    { key: "gender", label: "Gender" },
    { key: "photoNForm", label: "Photo & form" },
    { key: "photoNo", label: "Photo no" },
    { key: "maritalStatus", label: "Marital status" },
    { key: "depPos", label: "Dep pos" },
  ];

  const ints: Record<string, number | null> = {};
  for (const field of intFields) {
    const result = parseOptionalInt(body[field.key], field.label);
    if ("error" in result) {
      return {
        error: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    ints[field.key] = result.value;
  }

  const relationResult = parseOptionalFamilyRelationship(
    body.relationToPrincipal,
    "Relationship to principal"
  );
  if ("error" in relationResult) {
    return {
      error: NextResponse.json({ error: relationResult.error }, { status: 400 }),
    };
  }
  ints.relationToPrincipal = relationResult.value;

  const familyTitleResult = parseOptionalFamilyRelationship(
    body.familyTitle,
    "Family title"
  );
  if ("error" in familyTitleResult) {
    return {
      error: NextResponse.json(
        { error: familyTitleResult.error },
        { status: 400 }
      ),
    };
  }
  ints.familyTitle = familyTitleResult.value;

  const dateFields: { key: keyof BioDataFormData; label: string }[] = [
    { key: "dob", label: "Date of birth" },
    { key: "dateEntered", label: "Date entered" },
    { key: "cardToMember", label: "Card to member" },
    { key: "infoToPrinter", label: "Info to printer" },
    { key: "cardFromPrinter", label: "Card from printer" },
    { key: "appFormDate", label: "App form date" },
    { key: "dateEmployed", label: "Date employed" },
  ];

  const dates: Record<string, Date | null> = {};
  for (const field of dateFields) {
    const result = parseOptionalDate(body[field.key], field.label);
    if ("error" in result) {
      return {
        error: NextResponse.json({ error: result.error }, { status: 400 }),
      };
    }
    dates[field.key] = result.value;
  }

  return {
    data: {
      memberNo,
      familyNo,
      surname: trimOrNull(body.surname),
      firstName: trimOrNull(body.firstName),
      otherNames: trimOrNull(body.otherNames),
      dob: dates.dob,
      occupation: ints.occupation,
      idPpNo: trimOrNull(body.idPpNo),
      bloodGroup: ints.bloodGroup,
      relationToPrincipal: ints.relationToPrincipal,
      userId: trimOrNull(body.userId),
      dateEntered: dates.dateEntered,
      familyTitle: ints.familyTitle,
      dealingUser: trimOrNull(body.dealingUser),
      cancelled: ints.cancelled,
      employmentNo: trimOrNull(body.employmentNo),
      gender: ints.gender,
      cardToMember: dates.cardToMember,
      passportNo: trimOrNull(body.passportNo),
      nhifCardNo: trimOrNull(body.nhifCardNo),
      height: trimOrNull(body.height),
      weight: trimOrNull(body.weight),
      photoNForm: ints.photoNForm,
      photoNo: ints.photoNo,
      infoToPrinter: dates.infoToPrinter,
      cardFromPrinter: dates.cardFromPrinter,
      appFormDate: dates.appFormDate,
      maritalStatus: ints.maritalStatus,
      dateEmployed: dates.dateEmployed,
      depPos: ints.depPos,
      corpId: trimOrNull(body.corpId) || trimOrNull(corpIdFallback),
      mobileNo: trimOrNull(body.mobileNo),
      emailAdd: trimOrNull(body.emailAdd),
    } satisfies Prisma.MemberInfoUncheckedCreateInput,
  };
}

export function memberInfoToFormValues(row: {
  memberNo: string;
  familyNo: string;
  surname: string | null;
  firstName: string | null;
  otherNames: string | null;
  dob: Date | string | null;
  occupation: number | null;
  idPpNo: string | null;
  bloodGroup: number | null;
  relationToPrincipal: number | null;
  userId: string | null;
  dateEntered: Date | string | null;
  familyTitle: number | null;
  dealingUser: string | null;
  cancelled: number | null;
  employmentNo: string | null;
  gender: number | null;
  cardToMember: Date | string | null;
  passportNo: string | null;
  nhifCardNo: string | null;
  height: string | null;
  weight: string | null;
  photoNForm: number | null;
  photoNo: number | null;
  infoToPrinter: Date | string | null;
  cardFromPrinter: Date | string | null;
  appFormDate: Date | string | null;
  maritalStatus: number | null;
  dateEmployed: Date | string | null;
  depPos: number | null;
  corpId: string | null;
  mobileNo: string | null;
  emailAdd: string | null;
}): BioDataFormData {
  return {
    memberNo: row.memberNo,
    familyNo: row.familyNo,
    surname: row.surname ?? "",
    firstName: row.firstName ?? "",
    otherNames: row.otherNames ?? "",
    dob: formatDateValue(row.dob),
    occupation: intToString(row.occupation),
    idPpNo: row.idPpNo ?? "",
    bloodGroup: intToString(row.bloodGroup),
    relationToPrincipal: intToString(row.relationToPrincipal),
    userId: row.userId ?? "",
    dateEntered: formatDateValue(row.dateEntered),
    familyTitle: intToString(row.familyTitle),
    dealingUser: row.dealingUser ?? "",
    cancelled: intToString(row.cancelled),
    employmentNo: row.employmentNo ?? "",
    gender: intToString(row.gender),
    cardToMember: formatDateValue(row.cardToMember),
    passportNo: row.passportNo ?? "",
    nhifCardNo: row.nhifCardNo ?? "",
    height: row.height ?? "",
    weight: row.weight ?? "",
    photoNForm: intToString(row.photoNForm),
    photoNo: intToString(row.photoNo),
    infoToPrinter: formatDateValue(row.infoToPrinter),
    cardFromPrinter: formatDateValue(row.cardFromPrinter),
    appFormDate: formatDateValue(row.appFormDate),
    maritalStatus: intToString(row.maritalStatus),
    dateEmployed: formatDateValue(row.dateEmployed),
    depPos: intToString(row.depPos),
    corpId: row.corpId ?? "",
    mobileNo: row.mobileNo ?? "",
    emailAdd: row.emailAdd ?? "",
  };
}

export async function upsertMemberInfo(
  prisma: {
    memberInfo: {
      findUnique: (args: {
        where: { memberNo: string };
      }) => Promise<{ memberNo: string } | null>;
      create: (args: {
        data: Prisma.MemberInfoUncheckedCreateInput;
      }) => Promise<unknown>;
      update: (args: {
        where: { memberNo: string };
        data: Prisma.MemberInfoUncheckedUpdateInput;
      }) => Promise<unknown>;
    };
  },
  data: Prisma.MemberInfoUncheckedCreateInput
) {
  const existing = await prisma.memberInfo.findUnique({
    where: { memberNo: data.memberNo },
  });

  if (existing) {
    const { memberNo: _memberNo, ...updateData } = data;
    return prisma.memberInfo.update({
      where: { memberNo: data.memberNo },
      data: updateData,
    });
  }

  return prisma.memberInfo.create({ data });
}
