import type { LookupOption } from "./types";

export const BENE_CLASSES = [
  { key: 1, value: "INPATIENT" },
  { key: 2, value: "OUTPATIENT" },
] as const;

export type BeneClassKey = (typeof BENE_CLASSES)[number]["key"];

export const beneClassOptions: LookupOption[] = BENE_CLASSES.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
