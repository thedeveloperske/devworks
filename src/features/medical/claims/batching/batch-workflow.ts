import type { ClaimsBatchListItem } from "./types";

export function hasEntrantAssigned(batch: {
  dataEntryUser: string | null;
  dateEntryDate: string | null;
}) {
  return Boolean(batch.dataEntryUser?.trim() && batch.dateEntryDate);
}

export function canAssignVetter(batch: ClaimsBatchListItem) {
  return hasEntrantAssigned(batch);
}

export function hasVetterAssigned(batch: {
  vettingUser: string | null;
  vettingUserDate: string | null;
}) {
  return Boolean(batch.vettingUser?.trim() && batch.vettingUserDate);
}

export function canAssignAuthorizer(batch: ClaimsBatchListItem) {
  return hasVetterAssigned(batch);
}
