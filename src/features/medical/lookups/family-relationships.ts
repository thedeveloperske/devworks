import type { LookupOption } from "./types";

export const FAMILY_RELATIONSHIPS = [
  { key: 1, value: "Principal" },
  { key: 2, value: "Spouse" },
  { key: 3, value: "Son" },
  { key: 4, value: "Daughter" },
  { key: 5, value: "Dependant" },
] as const;

export type FamilyRelationshipKey = (typeof FAMILY_RELATIONSHIPS)[number]["key"];

export const familyRelationshipOptions: LookupOption[] =
  FAMILY_RELATIONSHIPS.map((item) => ({
    value: String(item.key),
    label: item.value,
  }));
