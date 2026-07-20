import type { LookupOption } from "./types";

export const FAMILY_SIZES = [
  { key: 1, value: "M" },
  { key: 2, value: "M+1" },
  { key: 3, value: "M+2" },
  { key: 4, value: "M+3" },
  { key: 5, value: "M+4" },
  { key: 6, value: "M+5" },
  { key: 7, value: "M+6" },
  { key: 8, value: "M+7" },
  { key: 9, value: "M+8" },
  { key: 10, value: "M+9" },
  { key: 11, value: "M+10" },
] as const;

export type FamilySizeKey = (typeof FAMILY_SIZES)[number]["key"];

export const familySizeOptions: LookupOption[] = FAMILY_SIZES.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
