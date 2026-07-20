import type { LookupOption } from "./types";

export const JOB_TITLES = [
  { key: 1, value: "General Manager" },
  { key: 2, value: "Managing Director" },
  { key: 3, value: "Chairman" },
  { key: 4, value: "Human Resource Manager" },
  { key: 5, value: "Self / Family" },
  { key: 6, value: "Personal Assistant" },
  { key: 7, value: "Care Of (C/O)" },
  { key: 8, value: "Public Relations" },
] as const;

export type JobTitleKey = (typeof JOB_TITLES)[number]["key"];

export const jobTitleOptions: LookupOption[] = JOB_TITLES.map((jobTitle) => ({
  value: String(jobTitle.key),
  label: jobTitle.value,
}));
