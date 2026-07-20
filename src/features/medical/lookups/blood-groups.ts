import type { LookupOption } from "./types";

export const BLOOD_GROUPS = [
  { key: 1, value: "O" },
  { key: 2, value: "A" },
  { key: 3, value: "B" },
  { key: 4, value: "AB" },
  { key: 5, value: "O +" },
  { key: 6, value: "O -" },
  { key: 7, value: "A +" },
  { key: 8, value: "A -" },
  { key: 9, value: "B +" },
  { key: 10, value: "B -" },
  { key: 11, value: "AB +" },
  { key: 12, value: "AB -" },
] as const;

export type BloodGroupKey = (typeof BLOOD_GROUPS)[number]["key"];

export const bloodGroupOptions: LookupOption[] = BLOOD_GROUPS.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
