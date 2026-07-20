import { cookies } from "next/headers";
import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import type { LookupOption } from "@/features/medical/lookups/types";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import type { ClaimsBatchListItem } from "../types";

function formatDate(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : null;
}

export async function loadClaimsBatchingPageData(): Promise<{
  batches: ClaimsBatchListItem[];
  providers: LookupOption[];
  currentUserName: string;
}> {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  const currentUserName = session?.name ?? session?.email ?? "";

  const [rows, providers] = await Promise.all([
    prisma.claimsBatch.findMany({
      orderBy: [{ batchDate: "desc" }, { idx: "desc" }],
    }),
    loadProviderOptions(),
  ]);

  const providerNameByCode = Object.fromEntries(
    providers.map((option) => [option.value, option.label])
  );

  const batches: ClaimsBatchListItem[] = rows.map((row) => {
    const providerCode = row.provider != null ? String(row.provider) : null;
    return {
      id: String(row.idx),
      batchNo: row.batchNo,
      batchDate: formatDate(row.batchDate),
      batchUser: row.batchUser,
      claimsCount: row.claimsCount != null ? String(row.claimsCount) : null,
      providerCode,
      providerName: providerCode ? (providerNameByCode[providerCode] ?? null) : null,
      dateReceived: formatDate(row.dateReceived),
      dataEntryUser: row.dataEntryUser,
      dateEntryDate: formatDate(row.dateEntryDate),
      vettingUser: row.vettingUser,
      vettingUserDate: formatDate(row.vettingUserDate),
      authorisingUser: row.authorisingUser,
      authorisingUserDate: formatDate(row.authorisingUserDate),
      financeUser: row.financeUser,
      financeUserDate: formatDate(row.financeUserDate),
    };
  });

  return { batches, providers, currentUserName };
}
