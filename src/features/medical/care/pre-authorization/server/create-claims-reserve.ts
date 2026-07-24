import { cookies } from "next/headers";
import type { Prisma } from "@/generated/prisma/client";
import { resolveSystemUsername } from "@/features/medical/claims/batching/resolve-system-username";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

async function resolveReserveUserId() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value
  );
  if (!session) return null;

  if (session.userId) {
    const userId = Number.parseInt(session.userId, 10);
    if (!Number.isNaN(userId)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      const username = user?.username?.trim();
      if (username) return username.slice(0, 10);
    }
  }

  const resolved = await resolveSystemUsername(session.email);
  const fallback = resolved ?? session.email ?? null;
  return fallback?.trim().slice(0, 10) || null;
}

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
  const userId = await resolveReserveUserId();
  const today = new Date(new Date().toISOString().slice(0, 10));

  return {
    preAuthNo: String(preAuth.code),
    memberNo: preAuth.memberNo.slice(0, 15),
    transType: "1",
    debit: null,
    credit: preAuth.reserve != null ? String(preAuth.reserve) : null,
    userId,
    dateEntered: today,
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
