import type { RawUploadRow } from "./parse-member-upload-file";

export type NormalizedMemberUploadRow = {
  rowNumber: number;
  corpId: string;
  surname: string;
  firstName: string;
  otherNames: string;
  dob: string;
  gender: string;
  category: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: string;
  employmentNo: string;
  mobileNo: string;
  email: string;
  idPpNo: string;
  occupation: string;
  bloodGroup: string;
};

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[\s_\-/]+/g, "");
}

const FIELD_ALIASES: Record<keyof Omit<NormalizedMemberUploadRow, "rowNumber">, string[]> = {
  corpId: ["corpid", "corp", "corporateid", "corporate", "employer"],
  surname: ["surname", "lastname", "last", "familyname"],
  firstName: ["firstname", "first", "givenname"],
  otherNames: ["othernames", "middlename", "middle", "othername"],
  dob: ["dob", "dateofbirth", "birthdate", "birth"],
  gender: ["gender", "sex"],
  category: ["category", "categorycode", "cat"],
  startDate: ["startdate", "coverstart", "periodstart", "inception"],
  endDate: ["enddate", "coverend", "periodend", "expiry"],
  renewalDate: ["renewaldate", "renewal"],
  status: ["status", "acceptancestatus", "acceptance"],
  employmentNo: ["employmentno", "employeeno", "staffno", "payrollno"],
  mobileNo: ["mobileno", "mobile", "phone", "tel", "cellphone"],
  email: ["email", "emailadd", "emailaddress"],
  idPpNo: ["idppno", "idno", "nationalid", "passportno", "passport", "id"],
  occupation: ["occupation", "job", "jobdescription"],
  bloodGroup: ["bloodgroup", "blood"],
};

function pickField(
  row: RawUploadRow,
  aliases: string[]
): string {
  const byNormalized = new Map<string, string>();
  for (const [key, value] of Object.entries(row)) {
    byNormalized.set(normalizeHeader(key), value.trim());
  }
  for (const alias of aliases) {
    const value = byNormalized.get(alias);
    if (value) return value;
  }
  return "";
}

function normalizeGender(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed === "1" || trimmed === "m" || trimmed === "male") return "1";
  if (trimmed === "2" || trimmed === "f" || trimmed === "female") return "2";
  return trimmed;
}

function normalizeStatus(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "1";
  if (
    trimmed === "1" ||
    trimmed === "accepted" ||
    trimmed === "accept" ||
    trimmed === "a"
  ) {
    return "1";
  }
  if (
    trimmed === "2" ||
    trimmed === "rejected" ||
    trimmed === "reject" ||
    trimmed === "r"
  ) {
    return "2";
  }
  if (
    trimmed === "3" ||
    trimmed === "deferred" ||
    trimmed === "defer" ||
    trimmed === "d"
  ) {
    return "3";
  }
  return trimmed;
}

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // DD/MM/YYYY or DD-MM-YYYY
  const slash = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slash) {
    const day = slash[1]!.padStart(2, "0");
    const month = slash[2]!.padStart(2, "0");
    const year = slash[3]!;
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return trimmed;
}

export function normalizeMemberUploadRows(
  rows: RawUploadRow[]
): NormalizedMemberUploadRow[] {
  return rows.map((row, index) => ({
    rowNumber: index + 2, // header is row 1
    corpId: pickField(row, FIELD_ALIASES.corpId),
    surname: pickField(row, FIELD_ALIASES.surname),
    firstName: pickField(row, FIELD_ALIASES.firstName),
    otherNames: pickField(row, FIELD_ALIASES.otherNames),
    dob: normalizeDate(pickField(row, FIELD_ALIASES.dob)),
    gender: normalizeGender(pickField(row, FIELD_ALIASES.gender)),
    category: pickField(row, FIELD_ALIASES.category),
    startDate: normalizeDate(pickField(row, FIELD_ALIASES.startDate)),
    endDate: normalizeDate(pickField(row, FIELD_ALIASES.endDate)),
    renewalDate: normalizeDate(pickField(row, FIELD_ALIASES.renewalDate)),
    status: normalizeStatus(pickField(row, FIELD_ALIASES.status)),
    employmentNo: pickField(row, FIELD_ALIASES.employmentNo),
    mobileNo: pickField(row, FIELD_ALIASES.mobileNo),
    email: pickField(row, FIELD_ALIASES.email),
    idPpNo: pickField(row, FIELD_ALIASES.idPpNo),
    occupation: pickField(row, FIELD_ALIASES.occupation),
    bloodGroup: pickField(row, FIELD_ALIASES.bloodGroup),
  }));
}

export function validateNormalizedUploadRow(
  row: NormalizedMemberUploadRow
): string | null {
  if (!row.corpId) return "corpId is required";
  if (!row.surname) return "surname is required";
  if (!row.firstName) return "firstName is required";
  if (!row.dob) return "dob is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dob)) {
    return "dob must be YYYY-MM-DD";
  }
  if (row.gender !== "1" && row.gender !== "2") {
    return "gender must be 1 (Male) or 2 (Female)";
  }
  if (!row.category) return "category is required";
  if (row.status !== "1" && row.status !== "2" && row.status !== "3") {
    return "status must be 1 (Accepted), 2 (Rejected), or 3 (Deferred)";
  }
  return null;
}
