import type { ManageClaimsMemberAnniversary } from "./types";

/**
 * Resolve anniv from member_anniversary where invoiceDate is within
 * [startDate, endDate] (inclusive). Prefer the highest anniv if multiple match.
 */
export function resolveAnnivForInvoiceDate(
  periods: ManageClaimsMemberAnniversary[],
  invoiceDate: string
): string {
  const date = invoiceDate.trim();
  if (!date) return "";

  let bestAnniv: string | null = null;
  let bestAnnivNum = Number.NEGATIVE_INFINITY;

  for (const period of periods) {
    const start = period.startDate.trim();
    const end = period.endDate.trim();
    if (!start || !end) continue;
    if (date < start || date > end) continue;

    const annivNum = Number(period.anniv);
    if (!Number.isFinite(annivNum)) continue;
    if (annivNum > bestAnnivNum) {
      bestAnnivNum = annivNum;
      bestAnniv = String(period.anniv);
    }
  }

  return bestAnniv ?? "";
}
