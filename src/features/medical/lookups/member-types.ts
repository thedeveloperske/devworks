import type { LookupOption } from "./types";

export const MEMBER_TYPES = [
  { key: "PRINCIPAL", value: "Principal" },
  { key: "DEPENDANT", value: "Dependant" },
] as const;

export type MemberTypeKey = (typeof MEMBER_TYPES)[number]["key"];

export const memberTypeOptions: LookupOption[] = MEMBER_TYPES.map((item) => ({
  value: item.key,
  label: item.value,
}));
