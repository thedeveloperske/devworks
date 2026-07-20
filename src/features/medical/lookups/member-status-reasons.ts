import type { LookupOption } from "./types";

/** Reasons shown when cancelling a member or family. */
export const MEMBER_CANCEL_REASONS = [
  { key: "1", value: "Left employment" },
  { key: "2", value: "Deceased" },
  { key: "3", value: "Cover transferred" },
  { key: "4", value: "Non-payment of premium" },
  { key: "5", value: "Member request" },
  { key: "6", value: "Duplicate membership" },
  { key: "7", value: "Other" },
] as const;

/** Reasons shown when reinstating a member or family. */
export const MEMBER_REINSTATE_REASONS = [
  { key: "1", value: "Rejoined employment" },
  { key: "2", value: "Premium paid" },
  { key: "3", value: "Admin correction" },
  { key: "4", value: "Member request" },
  { key: "5", value: "Other" },
] as const;

export const memberCancelReasonOptions: LookupOption[] =
  MEMBER_CANCEL_REASONS.map((item) => ({
    value: item.key,
    label: item.value,
  }));

export const memberReinstateReasonOptions: LookupOption[] =
  MEMBER_REINSTATE_REASONS.map((item) => ({
    value: item.key,
    label: item.value,
  }));
