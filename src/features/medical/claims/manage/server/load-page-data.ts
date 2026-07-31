import { loadProviderOptions } from "@/features/medical/admin/providers/server/load-page-data";
import type { LookupOption } from "@/features/medical/lookups/types";
import { prisma } from "@/lib/prisma";
import type { ManageClaimsListItem } from "../types";

function formatDate(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export async function loadManageClaimsPageData(): Promise<{
  claims: ManageClaimsListItem[];
  providerOptions: LookupOption[];
}> {
  const [rows, providerOptions] = await Promise.all([
    prisma.bill.findMany({
      orderBy: [{ invoiceDate: "desc" }, { invoiceNo: "desc" }],
      take: 200,
    }),
    loadProviderOptions(),
  ]);

  const providerNameByCode = Object.fromEntries(
    providerOptions.map((option) => [option.value, option.label])
  );

  const claims: ManageClaimsListItem[] = rows.map((row) => {
    const providerCode = String(row.provider);
    return {
      id: row.invoiceNo,
      claimNo: row.claimNo,
      memberNo: row.memberNo,
      memberName: "",
      providerName: providerNameByCode[providerCode] ?? providerCode,
      claimDate: formatDate(row.invoiceDate),
    };
  });

  return { claims, providerOptions };
}
