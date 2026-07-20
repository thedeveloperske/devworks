import { FAMILY_RELATIONSHIPS } from "@/features/medical/lookups/family-relationships";
import type { FamilyDependantRow } from "./family-dependant-types";

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

function relationshipLabel(value: number | null | undefined) {
  if (value == null) return "—";
  const match = FAMILY_RELATIONSHIPS.find((item) => item.key === value);
  return match?.value ?? String(value);
}

function genderLabel(value: number | null | undefined) {
  if (value === 1) return "Male";
  if (value === 2) return "Female";
  if (value == null) return "—";
  return String(value);
}

export function memberInfoToFamilyDependantRow(row: {
  memberNo: string;
  surname: string | null;
  firstName: string | null;
  otherNames: string | null;
  relationToPrincipal: number | null;
  gender: number | null;
  dob: Date | string | null;
}): FamilyDependantRow {
  return {
    memberNo: row.memberNo,
    surname: row.surname?.trim() || "—",
    firstName: row.firstName?.trim() || "—",
    otherNames: row.otherNames?.trim() || "—",
    relationToPrincipal: relationshipLabel(row.relationToPrincipal),
    gender: genderLabel(row.gender),
    dob: formatDateValue(row.dob) || "—",
  };
}
