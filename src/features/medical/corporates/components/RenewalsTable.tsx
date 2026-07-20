import { StatusBadge } from "@/components/admin/StatusBadge";
import type { RenewalListItem } from "@/features/medical/corporates";
import {
  emptyCellClass,
  tableClass,
  tableHeadClass,
  tableWrapperClass,
  tdClass,
  thClass,
} from "@/lib/form-styles";
import { formatDate } from "@/lib/format";

type RenewalsTableProps = {
  renewals: RenewalListItem[];
};

export function RenewalsTable({ renewals }: RenewalsTableProps) {
  return (
    <section id="corporates-renewals" className="mt-6 space-y-2">     
      <div className={tableWrapperClass}>
        <table className={tableClass}>
          <thead className={tableHeadClass}>
            <tr>
              <th className={thClass}>Corporate</th>
              <th className={thClass}>Policy No</th>
              <th className={thClass}>Anniv</th>
              <th className={thClass}>Start</th>
              <th className={thClass}>End</th>
              <th className={thClass}>Renewal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {renewals.length === 0 ? (
              <tr>
                <td colSpan={6} className={emptyCellClass}>
                  No corporate renewals found.
                </td>
              </tr>
            ) : (
              renewals.map((renewal) => (
                <tr key={renewal.id} className="transition-colors hover:bg-slate-50">
                  <td className={tdClass}>{renewal.corporate}</td>
                  <td className={tdClass}>{renewal.policyNo ?? "—"}</td>
                  <td className={tdClass}>{renewal.anniv}</td>
                  <td className={tdClass}>{formatDate(renewal.periodStart)}</td>
                  <td className={tdClass}>{formatDate(renewal.periodEnd)}</td>
                  <td className={tdClass}>{formatDate(renewal.renewalDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
