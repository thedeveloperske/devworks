import type { LookupOption } from "./types";

export const OCCUPATIONS = [
  { key: 1, value: "Advertising / Marketing / RP" },
  { key: 2, value: "Aerospace" },
  { key: 3, value: "Agriculture / Chemicals / Forest Products" },
  { key: 4, value: "Automotive" },
  { key: 5, value: "Computer / Electronics" },
  { key: 6, value: "Construction" },
  { key: 7, value: "Consumer Goods" },
  { key: 8, value: "Education" },
  { key: 9, value: "Energy / Mining" },
  { key: 10, value: "Finance / Insurance / Real Estate" },
  { key: 11, value: "Government / Military / Public Service" },
  { key: 12, value: "Hospitality / Recreation" },
  { key: 13, value: "Media / Publishing / Entertainment" },
  { key: 14, value: "Medical / Health Services" },
  { key: 15, value: "Pharmaceuticals" },
  { key: 16, value: "Retail" },
  { key: 17, value: "Service" },
  { key: 18, value: "Telecommunications / Networking" },
  { key: 19, value: "Travel / Transportation" },
  { key: 20, value: "Other" },
  { key: 21, value: "NGO" },
  { key: 22, value: "Legal" },
] as const;

export type OccupationKey = (typeof OCCUPATIONS)[number]["key"];

export const occupationOptions: LookupOption[] = OCCUPATIONS.map(
  (occupation) => ({
    value: String(occupation.key),
    label: occupation.value,
  })
);
