import type { LookupOption } from "./types";

export const BRANCHES = [
  { key: 1, value: "HEAD OFFICE" },
] as const;

export type BranchKey = (typeof BRANCHES)[number]["key"];

export const branchOptions: LookupOption[] = BRANCHES.map((item) => ({
  value: String(item.key),
  label: item.value,
}));
