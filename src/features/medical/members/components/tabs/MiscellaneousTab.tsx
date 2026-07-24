"use client";

import type { MemberCancellationHistoryRow } from "@/features/medical/members";

type MiscellaneousTabProps = {
  rows?: MemberCancellationHistoryRow[];
  /** When false (new member), cancellation history is hidden. */
  showCancellationHistory?: boolean;
};

const columns: {
  key: keyof MemberCancellationHistoryRow;
  label: string;
}[] = [
  { key: "dateCan", label: "Date" },
  { key: "action", label: "Action" },
  { key: "anniv", label: "Anniv" },
  { key: "reason", label: "Reason" },
  { key: "userId", label: "User" },
  { key: "dateEntered", label: "Date Entered" },
];

const columnMinWidth = 120;
const tableMinWidth = columns.length * columnMinWidth;
const tableBodyMaxHeight = 280;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "border-b border-slate-200 px-2 py-1.5 align-middle text-[12px] text-slate-600";
const emptyCellClass =
  "border-b border-slate-200 px-2 py-4 text-center text-[12px] text-slate-500";

export function MiscellaneousTab({
  rows = [],
  showCancellationHistory = false,
}: MiscellaneousTabProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-1.5">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">
          Miscellaneous
        </h3>
        <p className="text-[12px] text-slate-500">Misc information</p>
      </div>

      {showCancellationHistory ? (
        <>
          <div>
            <h4 className="text-[12px] font-bold uppercase text-slate-700">
              Cancellation & Reinstate History
            </h4>
            <p className="text-[12px] text-slate-500">
              Read-only history from member cancellations.
            </p>
          </div>
          <div
            className="min-h-0 overflow-x-auto overflow-y-scroll border border-slate-200"
            style={{ height: tableBodyMaxHeight }}
          >
            <table
              className="w-full border-collapse"
              style={{ minWidth: tableMinWidth }}
            >
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={thClass}
                      style={{
                        width: columnMinWidth,
                        minWidth: columnMinWidth,
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className={emptyCellClass}>
                      No cancellation or reinstatement history.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="bg-white">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={tdClass}
                          style={{
                            width: columnMinWidth,
                            minWidth: columnMinWidth,
                          }}
                        >
                          {row[column.key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
