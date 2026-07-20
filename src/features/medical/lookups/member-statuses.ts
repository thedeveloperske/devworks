import type { LookupOption } from "./types";

export const MEMBER_STATUSES = [
  { key: "ACTIVE", value: "Active" },
  { key: "INACTIVE", value: "Inactive" },
  { key: "PENDING", value: "Pending" },
] as const;

export type MemberStatusKey = (typeof MEMBER_STATUSES)[number]["key"];

export const memberStatusOptions: LookupOption[] = MEMBER_STATUSES.map((item) => ({
  value: item.key,
  label: item.value,
}));

/** Cover status codes stored on member_anniversary.status. */
export const MEMBER_COVER_STATUSES = [
  { key: "1", value: "Active" },
  { key: "2", value: "Suspended" },
  { key: "3", value: "Cancelled" },
] as const;

export const memberCoverStatusOptions: LookupOption[] =
  MEMBER_COVER_STATUSES.map((item) => ({
    value: item.key,
    label: item.value,
  }));
