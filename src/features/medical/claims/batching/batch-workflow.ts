import type { ClaimsBatchListItem } from "./types";

export function hasEntrantAssigned(batch: {
  dataEntryUser: string | null;
  dateEntryDate: string | Date | null;
}) {
  return Boolean(batch.dataEntryUser?.trim() && batch.dateEntryDate);
}

export function canAssignVetter(batch: ClaimsBatchListItem) {
  return hasEntrantAssigned(batch);
}

export function hasVetterAssigned(batch: {
  vettingUser: string | null;
  vettingUserDate: string | Date | null;
}) {
  return Boolean(batch.vettingUser?.trim() && batch.vettingUserDate);
}

export function canAssignAuthorizer(batch: ClaimsBatchListItem) {
  return hasVetterAssigned(batch);
}

export function hasAuthorizerAssigned(batch: {
  authorisingUser: string | null;
  authorisingUserDate: string | Date | null;
}) {
  return Boolean(batch.authorisingUser?.trim() && batch.authorisingUserDate);
}

export function canAssignFinance(batch: ClaimsBatchListItem) {
  return hasAuthorizerAssigned(batch);
}
