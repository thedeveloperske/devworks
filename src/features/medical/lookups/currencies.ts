import type { LookupOption } from "./types";

export const CURRENCIES = [
  { key: 1, value: "USD" },
  { key: 2, value: "KES" },
] as const;

export type CurrencyKey = (typeof CURRENCIES)[number]["key"];

export const currencyOptions: LookupOption[] = CURRENCIES.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
