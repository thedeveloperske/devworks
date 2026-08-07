import type { Prisma } from "@/generated/prisma/client";

/**
 * Allocates the next claim number as CLM{n}, where n is bills row count + 1.
 * Example: 1233 existing bills → CLM1234
 */
export async function generateNextClaimNo(
  tx: Prisma.TransactionClient
): Promise<string> {
  const count = await tx.bill.count();
  return `CLM${count + 1}`;
}
