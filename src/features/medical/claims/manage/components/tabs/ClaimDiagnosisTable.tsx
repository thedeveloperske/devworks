"use client";

import type { ChangeEvent } from "react";
import { Button } from "@/components/admin/Button";
import { claimDiagnosisFields } from "@/features/medical/claims/manage/claim-diagnosis-constants";
import type { ClaimDiagnosisFormData } from "@/features/medical/claims/manage/types";
import { inputClass } from "@/lib/form-styles";
import { ClaimRowActionsMenu } from "../ClaimRowActionsMenu";

type ClaimDiagnosisTableProps = {
  rows: ClaimDiagnosisFormData[];
  onRowChange: (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
};

const columnMinWidth = 140;
const removeColumnWidth = 40;
const tableMinWidth =
  claimDiagnosisFields.length * columnMinWidth + removeColumnWidth;
const tableBodyMaxHeight = 200;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";

export function ClaimDiagnosisTable({
  rows,
  onRowChange,
  onAddRow,
  onRemoveRow,
}: ClaimDiagnosisTableProps) {
  return (
    <section className="flex min-h-0 flex-col gap-1.5 border-t border-slate-200 pt-2">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div>
          <h3 className="text-[11px] font-bold uppercase text-slate-700">
            Clinical Diagnosis
          </h3>
          <p className="text-[11px] text-slate-500">
            Capture diagnosis codes for this claim
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onAddRow}>
          Add Diagnosis
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-slate-200 bg-slate-50/60 px-3 py-4 text-center text-[11px] text-slate-500">
          No diagnoses yet.{" "}
          <button
            type="button"
            onClick={onAddRow}
            className="font-medium text-maroon hover:underline"
          >
            Add a diagnosis
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
                {claimDiagnosisFields.map((field) => (
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
                <tr key={`diagnosis-${rowIndex}`} className="bg-white">
                  {claimDiagnosisFields.map((field) => (
                    <td
                      key={field.name}
                      className={tdClass}
                      style={{
                        width: columnMinWidth,
                        minWidth: columnMinWidth,
                      }}
                    >
                      <input
                        id={`claim-diagnosis-${rowIndex}-${field.name}`}
                        name={field.name}
                        aria-label={field.label}
                        type={field.type ?? "text"}
                        required={field.required}
                        value={row[field.name]}
                        onChange={(e) => onRowChange(rowIndex, e)}
                        readOnly={field.readOnly}
                        disabled={field.readOnly}
                        className={`${inputClass} min-w-[100px] ${
                          field.readOnly ? "bg-slate-50 text-slate-500" : ""
                        }`}
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
                    <ClaimRowActionsMenu
                      label={`Actions for diagnosis ${rowIndex + 1}`}
                      onRemove={() => onRemoveRow(rowIndex)}
                    />
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
