import type { Prisma } from "@/generated/prisma/client";
import {
  resolveSessionUsername,
  todayUtcDate,
} from "@/features/medical/care/pre-authorization/server/resolve-session-user";

/** Builds a claims_reserve row from a saved pre-authorization. */
export async function buildClaimsReserveFromPreAuthorization(
  preAuth: {
    code: number;
    memberNo: string;
    provider: Prisma.Decimal | number | string;
    authorityType: Prisma.Decimal | number | string | null;
    reserve: Prisma.Decimal | number | string | null;
    anniv: Prisma.Decimal | number | string | null;
    notes: string | null;
  }
): Promise<Prisma.ClaimsReserveCreateInput> {
  const userId = await resolveSessionUsername();

  return {
    preAuthNo: String(preAuth.code),
    memberNo: preAuth.memberNo.slice(0, 15),
    transType: "1",
    debit: null,
    credit: preAuth.reserve != null ? String(preAuth.reserve) : null,
    userId,
    dateEntered: todayUtcDate(),
    benefit: preAuth.authorityType != null ? String(preAuth.authorityType) : null,
    anniv: preAuth.anniv != null ? String(preAuth.anniv) : null,
    claimNo: null,
    invoiceNo: null,
    service: null,
    provider: String(preAuth.provider),
    notes: preAuth.notes?.trim().slice(0, 50) || null,
    batchNo: null,
  };
}
