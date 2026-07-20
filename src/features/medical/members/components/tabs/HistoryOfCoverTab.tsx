"use client";

import {
  getMemberAnniversaryFields,
  memberAnniversaryFieldNames,
  type MemberAnniversaryFormData,
} from "@/features/medical/members";

type HistoryOfCoverTabProps = {
  rows: MemberAnniversaryFormData[];
  onRowChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  fieldInputClass: string;
};

const visibleFields = getMemberAnniversaryFields(memberAnniversaryFieldNames);

const columnMinWidth = 120;
const tableMinWidth = visibleFields.length * columnMinWidth;
const tableBodyMaxHeight = 280;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";

function renderCell(
  field: (typeof visibleFields)[number],
  row: MemberAnniversaryFormData,
  rowIndex: number,
  onRowChange: HistoryOfCoverTabProps["onRowChange"],
  fieldInputClass: string
) {
  const fieldId = `cover-history-${rowIndex}-${field.name}`;
  const isMemberNo = field.name === "memberNo";
  const isLockedDate =
    field.name === "endDate" || field.name === "renewalDate";
  const isAnniv = field.name === "anniv";
  const disabled = isMemberNo || isLockedDate || isAnniv;
  const inputClass = disabled
    ? `${fieldInputClass} min-w-[120px] cursor-not-allowed bg-slate-50 text-slate-600`
    : `${fieldInputClass} min-w-[120px]`;

  return (
    <input
      id={fieldId}
      name={field.name}
      aria-label={field.label}
      type={field.type ?? "text"}
      required={field.required}
      value={row[field.name]}
      placeholder={
        isMemberNo && !row.memberNo ? "Assigned on create" : undefined
      }
      onChange={disabled ? () => undefined : (e) => onRowChange(rowIndex, e)}
      disabled={disabled}
      className={inputClass}
    />
  );
}

export function HistoryOfCoverTab({
  rows,
  onRowChange,
  fieldInputClass,
}: HistoryOfCoverTabProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-1.5">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">
          Cover Dates
        </h3>
        <p className="text-[12px] text-slate-500">
          Capture cover dates information.
        </p>
      </div>
      {rows.length > 0 ? (
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
                {visibleFields.map((field) => (
                  <th
                    key={field.name}
                    className={thClass}
                    style={{
                      width: columnMinWidth,
                      minWidth: columnMinWidth,
                    }}
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={`${row.anniv || "new"}-${rowIndex}`}
                  className="bg-white"
                >
                  {visibleFields.map((field) => (
                    <td
                      key={field.name}
                      className={tdClass}
                      style={{
                        width: columnMinWidth,
                        minWidth: columnMinWidth,
                      }}
                    >
                      {renderCell(
                        field,
                        row,
                        rowIndex,
                        onRowChange,
                        fieldInputClass
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
