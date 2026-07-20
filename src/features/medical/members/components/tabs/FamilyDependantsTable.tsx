"use client";

import { Button } from "@/components/admin/Button";
import {
  familyDependantColumns,
  type FamilyDependantRow,
} from "@/features/medical/members";

type FamilyDependantsTableProps = {
  rows: FamilyDependantRow[];
  withTopBorder?: boolean;
  onAddDependant?: () => void;
  /** Opens a dependant for editing. */
  onEditDependant?: (memberNo: string) => void;
};

const columnMinWidth = 120;
const tableMinWidth = familyDependantColumns.length * columnMinWidth;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-[12px] text-slate-700";

export function FamilyDependantsTable({
  rows,
  withTopBorder = false,
  onAddDependant,
  onEditDependant,
}: FamilyDependantsTableProps) {
  return (
    <section
      className={`space-y-1.5${withTopBorder ? " border-t border-slate-200 pt-2" : ""}`}
    >
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h3 className="text-[12px] font-bold uppercase text-slate-700">
            Dependants
          </h3>
          <p className="text-[12px] text-slate-500">
            Family members linked to this principal.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onAddDependant}
        >
          Add Dependant
        </Button>
      </div>
      <div className="overflow-x-auto border border-slate-200">
        <table
          className="w-full border-collapse"
          style={{ minWidth: tableMinWidth }}
        >
          <thead className="bg-slate-50">
            <tr>
              {familyDependantColumns.map((column) => (
                <th
                  key={column.key}
                  className={thClass}
                  style={{ width: columnMinWidth, minWidth: columnMinWidth }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.memberNo} className="bg-white hover:bg-slate-50">
                  {familyDependantColumns.map((column) => (
                    <td
                      key={column.key}
                      className={tdClass}
                      style={{ width: columnMinWidth, minWidth: columnMinWidth }}
                    >
                      {column.key === "memberNo" && onEditDependant ? (
                        <button
                          type="button"
                          onClick={() => onEditDependant(row.memberNo)}
                          className="font-semibold text-maroon hover:underline"
                        >
                          {row.memberNo}
                        </button>
                      ) : (
                        row[column.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="bg-white">
                <td
                  className={`${tdClass} text-slate-500`}
                  colSpan={familyDependantColumns.length}
                >
                  No dependants for this family.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
