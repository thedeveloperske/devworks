import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { ContactPersonFormData, ContactPersonInput } from "./types";

function trimOrNull(value?: string | null, maxLength?: number) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (maxLength != null && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
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

export function hasContactPersonRowInput(contactPerson?: ContactPersonInput) {
  if (!contactPerson) return false;
  return Boolean(
    contactPerson.title?.trim() ||
      contactPerson.surname?.trim() ||
      contactPerson.firstName?.trim() ||
      contactPerson.otherNames?.trim() ||
      contactPerson.jobTitle?.trim() ||
      contactPerson.mobileNo?.trim() ||
      contactPerson.telNo?.trim() ||
      contactPerson.email?.trim()
  );
}

export function hasContactPersonsInput(contactPersons?: ContactPersonInput[]) {
  if (!contactPersons?.length) return false;
  return contactPersons.some(hasContactPersonRowInput);
}

type ContactPersonSyncRow = Prisma.CorpContactPersonUncheckedCreateInput & {
  idx?: number;
};

type BuildContactPersonsResult =
  | { data: ContactPersonSyncRow[] }
  | { error: NextResponse };

function buildContactPersonRowData(
  contactPerson: ContactPersonInput,
  corpId: string,
  rowLabel: string
): { data: ContactPersonSyncRow } | { error: NextResponse } {
  const titleResult = parseOptionalInt(contactPerson.title, "Title");
  if ("error" in titleResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${titleResult.error}` },
        { status: 400 }
      ),
    };
  }

  const jobTitleResult = parseRequiredInt(contactPerson.jobTitle, "Job title");
  if ("error" in jobTitleResult) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: ${jobTitleResult.error}` },
        { status: 400 }
      ),
    };
  }

  const email = trimOrNull(contactPerson.email, 40);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      error: NextResponse.json(
        { error: `${rowLabel}: Invalid email address` },
        { status: 400 }
      ),
    };
  }

  return {
    data: {
      idx:
        contactPerson.idx != null && contactPerson.idx !== ""
          ? Number(contactPerson.idx)
          : undefined,
      corpId,
      title: titleResult.value,
      surname: trimOrNull(contactPerson.surname, 20),
      firstName: trimOrNull(contactPerson.firstName, 20),
      otherNames: trimOrNull(contactPerson.otherNames, 20),
      jobTitle: jobTitleResult.value,
      mobileNo: trimOrNull(contactPerson.mobileNo, 30),
      telNo: trimOrNull(contactPerson.telNo, 20),
      email,
    },
  };
}

export function buildContactPersonsData(
  contactPersons: ContactPersonInput[] | undefined,
  corporate: { corpId: string | null }
): BuildContactPersonsResult {
  if (!hasContactPersonsInput(contactPersons)) {
    return { data: [] as ContactPersonSyncRow[] };
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

  const rows: ContactPersonSyncRow[] = [];

  for (const [index, contactPerson] of (contactPersons ?? []).entries()) {
    if (!hasContactPersonRowInput(contactPerson)) {
      continue;
    }

    const rowLabel = `Contact person row ${index + 1}`;
    const rowResult = buildContactPersonRowData(contactPerson, corpId, rowLabel);
    if ("error" in rowResult) {
      return rowResult;
    }

    rows.push(rowResult.data);
  }

  return { data: rows };
}

export function corpContactPersonToFormValues(contactPerson: {
  idx: number;
  title: number | null;
  surname: string | null;
  firstName: string | null;
  otherNames: string | null;
  jobTitle: number;
  mobileNo: string | null;
  telNo: string | null;
  email: string | null;
}): ContactPersonFormData {
  return {
    idx: contactPerson.idx,
    title: contactPerson.title != null ? String(contactPerson.title) : "",
    surname: contactPerson.surname ?? "",
    firstName: contactPerson.firstName ?? "",
    otherNames: contactPerson.otherNames ?? "",
    jobTitle: String(contactPerson.jobTitle),
    mobileNo: contactPerson.mobileNo ?? "",
    telNo: contactPerson.telNo ?? "",
    email: contactPerson.email ?? "",
  };
}

type CorpContactPersonClient = Pick<Prisma.TransactionClient, "corpContactPerson">;

export async function syncCorpContactPersons(
  prisma: CorpContactPersonClient,
  corpId: string,
  rows: ContactPersonSyncRow[]
) {
  const existing = await prisma.corpContactPerson.findMany({
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
    await prisma.corpContactPerson.deleteMany({
      where: { idx: { in: deleteIdxs } },
    });
  }

  for (const row of rows) {
    const { idx, ...data } = row;

    if (idx != null) {
      await prisma.corpContactPerson.update({
        where: { idx },
        data: {
          title: data.title,
          surname: data.surname,
          firstName: data.firstName,
          otherNames: data.otherNames,
          jobTitle: data.jobTitle,
          mobileNo: data.mobileNo,
          telNo: data.telNo,
          email: data.email,
        },
      });
      continue;
    }

    await prisma.corpContactPerson.create({ data });
  }
}
