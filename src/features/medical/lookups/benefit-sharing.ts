import type { LookupOption } from "./types";

export const BENEFIT_SHARING = [
  { key: 1, value: "PER FAMILY" },
  { key: 2, value: "PER PERSON" },
  { key: 3, value: "PER PRINCIPAL" },
  { key: 4, value: "PER DEPENDANT" },
] as const;

export type BenefitSharingKey = (typeof BENEFIT_SHARING)[number]["key"];

export const benefitSharingOptions: LookupOption[] = BENEFIT_SHARING.map((option) => ({
  value: String(option.key),
  label: option.value,
}));
