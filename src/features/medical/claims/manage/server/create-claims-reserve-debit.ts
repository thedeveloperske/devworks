import type { Prisma } from "@/generated/prisma/client";
import {
  resolveSessionUsername,
  todayUtcDate,
} from "@/features/medical/care/pre-authorization/server/resolve-session-user";

/** Builds a claims_reserve debit row when a claim is attached to a preauth. */
export async function buildClaimsReserveDebitFromClaim(args: {
  preAuthNo: string;
  memberNo: string;
  claimNo: string;
  invoiceNo: string;
  invoicedAmount: string;
  provider: string;
  service: string;
  claimNature: string | null;
  anniv: string | null;
  batchNo: string | null;
}): Promise<Prisma.ClaimsReserveCreateInput> {
  const userId = await resolveSessionUsername();

  return {
    preAuthNo: args.preAuthNo,
    memberNo: args.memberNo.slice(0, 15),
    transType: "2",
    debit: args.invoicedAmount,
    credit: null,
    userId,
    dateEntered: todayUtcDate(),
    benefit: args.claimNature,
    anniv: args.anniv,
    claimNo: args.claimNo.slice(0, 20),
    invoiceNo: args.invoiceNo.slice(0, 20),
    service: args.service,
    provider: args.provider,
    notes: null,
    batchNo: args.batchNo && /^\d+$/.test(args.batchNo) ? args.batchNo : null,
  };
}
