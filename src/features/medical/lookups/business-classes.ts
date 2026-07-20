import type { LookupOption } from "./types";

export const BUSINESS_CLASSES = [
  { key: 1, value: "CORPORATE" },
  { key: 2, value: "INDIVIDUAL" },
] as const;

export type BusinessClassKey = (typeof BUSINESS_CLASSES)[number]["key"];

export const businessClassOptions: LookupOption[] = BUSINESS_CLASSES.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
