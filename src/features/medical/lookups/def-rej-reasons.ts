import type { LookupOption } from "./types";

export const DEF_REJ_REASONS = [
  { key: 1, value: "Application form incomplete" },
  { key: 2, value: "No Photo attached" },
  { key: 3, value: "Risk is too high" },
  { key: 4, value: "Doctor Report needed" },
  { key: 5, value: "Member Rejected Before" },
] as const;

export type DefRejReasonKey = (typeof DEF_REJ_REASONS)[number]["key"];

export const defRejOptions: LookupOption[] = DEF_REJ_REASONS.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
