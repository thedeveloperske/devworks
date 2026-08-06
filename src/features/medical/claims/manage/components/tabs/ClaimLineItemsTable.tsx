"use client";

import { Button } from "@/components/admin/Button";
import {
  claimLineItemFields,
} from "@/features/medical/claims/manage/claim-line-item-constants";
import type {
  ClaimLineItemField,
  ClaimLineItemFormData,
} from "@/features/medical/claims/manage/types";
import { inputClass } from "@/lib/form-styles";

type ClaimLineItemsTableProps = {
  rows: ClaimLineItemFormData[];
  onRowChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
};

const columnMinWidth = 120;
const itemNameColumnWidth = 220;
const removeColumnWidth = 72;
const tableMinWidth =
  (claimLineItemFields.length - 1) * columnMinWidth +
  itemNameColumnWidth +
  removeColumnWidth;
const tableBodyMaxHeight = 200;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";

function getColumnWidth(fieldName: ClaimLineItemField["name"]) {
  return fieldName === "itemName" ? itemNameColumnWidth : columnMinWidth;
}

export function ClaimLineItemsTable({
  rows,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: ClaimLineItemsTableProps) {
  return (
    <section className="flex min-h-0 flex-col gap-1.5">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-bold uppercase text-slate-700">
            Claim Line Items
          </h3>
          <p className="text-[11px] text-slate-500">
            Capture services and amounts for this claim
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onAddRow}>
          Add Line
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-[11px] text-slate-500">
          No line items yet.{" "}
          <button
            type="button"
            onClick={onAddRow}
            className="font-medium text-maroon hover:underline"
          >
            Add a line
          </button>
        </div>
      ) : (
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
                {claimLineItemFields.map((field) => (
                  <th
                    key={field.name}
                    className={thClass}
                    style={{
                      width: getColumnWidth(field.name),
                      minWidth: getColumnWidth(field.name),
                    }}
                  >
                    {field.label}
                  </th>
                ))}
                <th
                  className={thClass}
                  style={{
                    width: removeColumnWidth,
                    minWidth: removeColumnWidth,
                  }}
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`line-${rowIndex}`} className="bg-white">
                  {claimLineItemFields.map((field) => (
                    <td
                      key={field.name}
                      className={tdClass}
                      style={{
                        width: getColumnWidth(field.name),
                        minWidth: getColumnWidth(field.name),
                      }}
                    >
                      <input
                        id={`claim-line-${rowIndex}-${field.name}`}
                        name={field.name}
                        aria-label={field.label}
                        type={field.type ?? "text"}
                        required={field.required}
                        value={row[field.name]}
                        onChange={(e) => onRowChange(rowIndex, e)}
                        className={`${inputClass} min-w-[100px]`}
                      />
                    </td>
                  ))}
                  <td
                    className={tdClass}
                    style={{
                      width: removeColumnWidth,
                      minWidth: removeColumnWidth,
                    }}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onRemoveRow(rowIndex)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
