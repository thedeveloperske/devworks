import type { LookupOption } from "./types";

export const TITLES = [
  { key: 1, value: "Mr." },
  { key: 2, value: "Mrs." },
  { key: 3, value: "Prof." },
  { key: 4, value: "Dr." },
  { key: 5, value: "Ms." },
  { key: 6, value: "Miss." },
] as const;

export type TitleKey = (typeof TITLES)[number]["key"];

export const titleOptions: LookupOption[] = TITLES.map((title) => ({
  value: String(title.key),
  label: title.value,
}));
