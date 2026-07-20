import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { PrincipalInformationFormData } from "./principal-information-types";

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
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

function parseOptionalDecimalFlag(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as string | null };
  if (trimmed !== "0" && trimmed !== "1") {
    return { error: `${label} must be 0 or 1` };
  }
  return { value: trimmed };
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

export function buildPrincipalApplicantData(
  body: Partial<PrincipalInformationFormData> | undefined
) {
  if (!body) {
    return {
      error: NextResponse.json(
        { error: "Principal information is required" },
        { status: 400 }
      ),
    };
  }

  if (!body.familyNo?.trim()) {
    return {
      error: NextResponse.json(
        { error: "Family number is required" },
        { status: 400 }
      ),
    };
  }
  if (!body.memberNo?.trim()) {
    return {
      error: NextResponse.json(
        { error: "Member number is required" },
        { status: 400 }
      ),
    };
  }

  const townResult = parseOptionalInt(body.town, "Town");
  if ("error" in townResult) {
    return { error: NextResponse.json({ error: townResult.error }, { status: 400 }) };
  }
  const familySizeResult = parseOptionalInt(body.familySize, "Family size");
  if ("error" in familySizeResult) {
    return {
      error: NextResponse.json({ error: familySizeResult.error }, { status: 400 }),
    };
  }
  const relationResult = parseOptionalInt(body.relationToFamily, "Relation to family");
  if ("error" in relationResult) {
    return {
      error: NextResponse.json({ error: relationResult.error }, { status: 400 }),
    };
  }
  const individualResult = parseOptionalDecimalFlag(body.individual, "Individual");
  if ("error" in individualResult) {
    return {
      error: NextResponse.json({ error: individualResult.error }, { status: 400 }),
    };
  }
  const witnessedResult = parseOptionalInt(body.witnessed, "Witnessed");
  if ("error" in witnessedResult) {
    return {
      error: NextResponse.json({ error: witnessedResult.error }, { status: 400 }),
    };
  }
  const provinceResult = parseOptionalInt(body.province, "Province");
  if ("error" in provinceResult) {
    return {
      error: NextResponse.json({ error: provinceResult.error }, { status: 400 }),
    };
  }
  const formFilledResult = parseOptionalInt(body.formFilled, "Form filled");
  if ("error" in formFilledResult) {
    return {
      error: NextResponse.json({ error: formFilledResult.error }, { status: 400 }),
    };
  }
  const departmentResult = parseOptionalInt(body.department, "Department");
  if ("error" in departmentResult) {
    return {
      error: NextResponse.json({ error: departmentResult.error }, { status: 400 }),
    };
  }
  const insurerResult = parseOptionalInt(body.insurer, "Insurer");
  if ("error" in insurerResult) {
    return {
      error: NextResponse.json({ error: insurerResult.error }, { status: 400 }),
    };
  }
  const maritalStatusResult = parseOptionalInt(body.maritalStatus, "Marital status");
  if ("error" in maritalStatusResult) {
    return {
      error: NextResponse.json(
        { error: maritalStatusResult.error },
        { status: 400 }
      ),
    };
  }
  const branchResult = parseOptionalInt(body.branch, "Branch");
  if ("error" in branchResult) {
    return {
      error: NextResponse.json({ error: branchResult.error }, { status: 400 }),
    };
  }
  const shareDataResult = parseOptionalInt(body.shareData, "Share data");
  if ("error" in shareDataResult) {
    return {
      error: NextResponse.json({ error: shareDataResult.error }, { status: 400 }),
    };
  }

  const dateFormReceivedResult = parseOptionalDate(
    body.dateFormReceived,
    "Date form received"
  );
  if ("error" in dateFormReceivedResult) {
    return {
      error: NextResponse.json(
        { error: dateFormReceivedResult.error },
        { status: 400 }
      ),
    };
  }
  const dateWitnessedResult = parseOptionalDate(body.dateWitnessed, "Date witnessed");
  if ("error" in dateWitnessedResult) {
    return {
      error: NextResponse.json(
        { error: dateWitnessedResult.error },
        { status: 400 }
      ),
    };
  }
  const dateEnteredResult = parseOptionalDate(body.dateEntered, "Date entered");
  if ("error" in dateEnteredResult) {
    return {
      error: NextResponse.json({ error: dateEnteredResult.error }, { status: 400 }),
    };
  }
  const dateEmployedResult = parseOptionalDate(body.dateEmployed, "Date employed");
  if ("error" in dateEmployedResult) {
    return {
      error: NextResponse.json({ error: dateEmployedResult.error }, { status: 400 }),
    };
  }

  return {
    data: {
      familyNo: body.familyNo.trim(),
      memberNo: body.memberNo.trim(),
      surname: trimOrNull(body.surname),
      firstName: trimOrNull(body.firstName),
      otherNames: trimOrNull(body.otherNames),
      agentId: trimOrNull(body.agentId),
      corpId: trimOrNull(body.corpId),
      employer: trimOrNull(body.employer),
      telNo: trimOrNull(body.telNo),
      mobileNo: trimOrNull(body.mobileNo),
      postalAdd: trimOrNull(body.postalAdd),
      town: townResult.value,
      email: trimOrNull(body.email),
      phyLoc: trimOrNull(body.phyLoc),
      familySize: familySizeResult.value,
      relationToFamily: relationResult.value,
      individual: individualResult.value,
      dateFormReceived: dateFormReceivedResult.value,
      witnessed: witnessedResult.value,
      dateWitnessed: dateWitnessedResult.value,
      userId: trimOrNull(body.userId),
      dateEntered: dateEnteredResult.value,
      province: provinceResult.value,
      formFilled: formFilledResult.value,
      department: departmentResult.value,
      insurer: insurerResult.value,
      category: trimOrNull(body.category),
      maritalStatus: maritalStatusResult.value,
      dateEmployed: dateEmployedResult.value,
      previousInsurer: trimOrNull(body.previousInsurer),
      periodInsured: trimOrNull(body.periodInsured),
      beneficiary: trimOrNull(body.beneficiary),
      beneficiaryId: trimOrNull(body.beneficiaryId),
      beneficiaryRelation: trimOrNull(body.beneficiaryRelation),
      policyNo: trimOrNull(body.policyNo),
      pinNo: trimOrNull(body.pinNo),
      branch: branchResult.value,
      shareData: shareDataResult.value,
    } satisfies Prisma.PrincipalApplicantUncheckedCreateInput,
  };
}

export function principalApplicantToFormValues(row: {
  familyNo: string;
  memberNo: string;
  surname: string | null;
  firstName: string | null;
  otherNames: string | null;
  agentId: string | null;
  corpId: string | null;
  employer: string | null;
  telNo: string | null;
  mobileNo: string | null;
  postalAdd: string | null;
  town: number | null;
  email: string | null;
  phyLoc: string | null;
  familySize: number | null;
  relationToFamily: number | null;
  individual: { toString(): string } | string | null;
  dateFormReceived: Date | string | null;
  witnessed: number | null;
  dateWitnessed: Date | string | null;
  userId: string | null;
  dateEntered: Date | string | null;
  province: number | null;
  formFilled: number | null;
  department: number | null;
  insurer: number | null;
  category: string | null;
  maritalStatus: number | null;
  dateEmployed: Date | string | null;
  previousInsurer: string | null;
  periodInsured: string | null;
  beneficiary: string | null;
  beneficiaryId: string | null;
  beneficiaryRelation: string | null;
  policyNo: string | null;
  pinNo: string | null;
  branch: number | null;
  shareData: number | null;
}): PrincipalInformationFormData {
  return {
    familyNo: row.familyNo,
    memberNo: row.memberNo,
    surname: row.surname ?? "",
    firstName: row.firstName ?? "",
    otherNames: row.otherNames ?? "",
    agentId: row.agentId ?? "",
    corpId: row.corpId ?? "",
    employer: row.employer ?? "",
    telNo: row.telNo ?? "",
    mobileNo: row.mobileNo ?? "",
    postalAdd: row.postalAdd ?? "",
    town: row.town != null ? String(row.town) : "",
    email: row.email ?? "",
    phyLoc: row.phyLoc ?? "",
    familySize: row.familySize != null ? String(row.familySize) : "",
    relationToFamily:
      row.relationToFamily != null ? String(row.relationToFamily) : "",
    individual: row.individual != null ? String(row.individual) : "",
    businessClass: "",
    dateFormReceived: formatDateValue(row.dateFormReceived),
    witnessed: row.witnessed != null ? String(row.witnessed) : "",
    dateWitnessed: formatDateValue(row.dateWitnessed),
    userId: row.userId ?? "",
    dateEntered: formatDateValue(row.dateEntered),
    province: row.province != null ? String(row.province) : "",
    formFilled: row.formFilled != null ? String(row.formFilled) : "",
    department: row.department != null ? String(row.department) : "",
    insurer: row.insurer != null ? String(row.insurer) : "",
    category: row.category ?? "",
    maritalStatus: row.maritalStatus != null ? String(row.maritalStatus) : "",
    dateEmployed: formatDateValue(row.dateEmployed),
    previousInsurer: row.previousInsurer ?? "",
    periodInsured: row.periodInsured ?? "",
    beneficiary: row.beneficiary ?? "",
    beneficiaryId: row.beneficiaryId ?? "",
    beneficiaryRelation: row.beneficiaryRelation ?? "",
    policyNo: row.policyNo ?? "",
    pinNo: row.pinNo ?? "",
    branch: row.branch != null ? String(row.branch) : "",
    shareData: row.shareData != null ? String(row.shareData) : "",
  };
}

export async function upsertPrincipalApplicant(
  prisma: {
    principalApplicant: {
      findUnique: (args: {
        where: { memberNo: string };
      }) => Promise<{ idx: number } | null>;
      create: (args: {
        data: Prisma.PrincipalApplicantUncheckedCreateInput;
      }) => Promise<unknown>;
      update: (args: {
        where: { idx: number };
        data: Prisma.PrincipalApplicantUncheckedUpdateInput;
      }) => Promise<unknown>;
    };
  },
  data: Prisma.PrincipalApplicantUncheckedCreateInput
) {
  const existing = await prisma.principalApplicant.findUnique({
    where: { memberNo: data.memberNo },
  });

  if (existing) {
    const { memberNo: _memberNo, ...updateData } = data;
    return prisma.principalApplicant.update({
      where: { idx: existing.idx },
      data: updateData,
    });
  }

  return prisma.principalApplicant.create({ data });
}
