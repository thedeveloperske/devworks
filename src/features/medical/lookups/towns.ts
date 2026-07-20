import type { LookupOption } from "./types";

export const TOWNS = [
  { key: 1, value: "NAIROBI" },
  { key: 2, value: "MOGADISHU" },
] as const;

export type TownKey = (typeof TOWNS)[number]["key"];

export const townOptions: LookupOption[] = TOWNS.map((town) => ({
  value: String(town.key),
  label: town.value,
}));
