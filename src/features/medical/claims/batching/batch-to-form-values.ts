import type { ClaimsBatch } from "@/generated/prisma/client";
import type { ClaimsBatchFormData } from "./types";

function formatDateInput(value: Date | null | undefined) {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export function batchToFormValues(batch: ClaimsBatch): ClaimsBatchFormData {
  return {
    batchNo: batch.batchNo ?? "",
    batchDate: formatDateInput(batch.batchDate),
    batchUser: batch.batchUser ?? "",
    claimsCount: batch.claimsCount != null ? String(batch.claimsCount) : "0",
    provider: batch.provider != null ? String(batch.provider) : "",
    dateReceived: formatDateInput(batch.dateReceived),
    dataEntryUser: batch.dataEntryUser ?? "",
    dateEntryDate: formatDateInput(batch.dateEntryDate),
    vettingUser: batch.vettingUser ?? "",
    vettingUserDate: formatDateInput(batch.vettingUserDate),
    authorisingUser: batch.authorisingUser ?? "",
    authorisingUserDate: formatDateInput(batch.authorisingUserDate),
    financeUser: batch.financeUser ?? "",
    financeUserDate: formatDateInput(batch.financeUserDate),
  };
}
