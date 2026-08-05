"use client";

import type { ManageClaimsHistoryItem } from "@/features/medical/claims/manage/types";

type MemberClaimHistoryTabProps = {
  rows?: ManageClaimsHistoryItem[];
  memberNo?: string;
};

const tableBodyMaxHeight = 280;
const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 align-middle text-[11px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[11px] text-slate-500";

export function MemberClaimHistoryTab({
  rows = [],
  memberNo = "",
}: MemberClaimHistoryTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
      <div className="shrink-0">
        <h3 className="text-[11px] font-bold uppercase text-slate-700">
          Member Claim History
        </h3>
        <p className="text-[11px] text-slate-500">
          {memberNo
            ? `Prior bills for member ${memberNo}`
            : "Prior bills for this member"}
        </p>
      </div>

      <div
        className="min-h-0 flex-1 overflow-x-auto overflow-y-scroll border border-slate-200"
        style={{ maxHeight: tableBodyMaxHeight }}
      >
        <table className="w-full min-w-[880px] border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className={thClass}>Provider</th>
              <th className={thClass}>Claim No</th>
              <th className={thClass}>Service</th>
              <th className={thClass}>Benefit</th>
              <th className={thClass}>Invoice Date</th>
              <th className={thClass}>Date Received</th>
              <th className={thClass}>Date Entered</th>
              <th className={`${thClass} text-right`}>Invoiced Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className={emptyCellClass}>
                  No prior claims found for this member.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="bg-white hover:bg-slate-50">
                  <td className={tdClass}>{row.provider || "—"}</td>
                  <td className={tdClass}>{row.claimNo || "—"}</td>
                  <td className={tdClass}>{row.service || "—"}</td>
                  <td className={tdClass}>{row.benefit || "—"}</td>
                  <td className={tdClass}>{row.invoiceDate || "—"}</td>
                  <td className={tdClass}>{row.dateReceived || "—"}</td>
                  <td className={tdClass}>{row.dateEntered || "—"}</td>
                  <td className={`${tdClass} text-right`}>
                    {row.invoicedAmount || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
