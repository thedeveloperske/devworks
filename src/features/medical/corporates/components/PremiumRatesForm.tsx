"use client";

import { Button } from "@/components/admin/Button";
import { premiumRateFields } from "@/features/medical/corporates";
import type { PremiumRateFormData } from "@/features/medical/corporates";
import { businessClassOptions, familySizeOptions } from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";

type PremiumRatesFormProps = {
  rows: PremiumRateFormData[];
  benefitOptions: LookupOption[];
  businessClass: string;
  onRowChange: (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  fieldLabelClass: string;
  fieldInputClass: string;
};

const columnMinWidth = 120;
const removeColumnWidth = 88;
const tableMinWidth =
  premiumRateFields.length * columnMinWidth + removeColumnWidth;
const tableBodyMaxHeight = 280;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";

function renderSelect(
  id: string,
  name: string,
  label: string,
  value: string,
  options: LookupOption[],
  placeholder: string,
  className: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  opts?: { required?: boolean; disabled?: boolean }
) {
  return (
    <select
      id={id}
      name={name}
      aria-label={label}
      required={opts?.required}
      disabled={opts?.disabled}
      value={value}
      onChange={onChange}
      className={className}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function renderCell(
  field: (typeof premiumRateFields)[number],
  row: PremiumRateFormData,
  rowIndex: number,
  benefitOptions: LookupOption[],
  businessClass: string,
  onRowChange: PremiumRatesFormProps["onRowChange"],
  fieldInputClass: string
) {
  const fieldId = `premium-rate-${rowIndex}-${field.name}`;
  const selectClass = `${fieldInputClass} h-[30px] min-w-[120px]`;

  if (field.name === "benefit") {
    return renderSelect(
      fieldId,
      field.name,
      field.label,
      row.benefit,
      benefitOptions,
      "Select benefit",
      selectClass,
      (e) => onRowChange(rowIndex, e),
      { required: field.required }
    );
  }

  if (field.name === "premiumType") {
    return renderSelect(
      fieldId,
      field.name,
      field.label,
      businessClass,
      businessClassOptions,
      "Select business class",
      `${selectClass} cursor-not-allowed bg-slate-50 text-slate-600`,
      () => undefined,
      { disabled: true }
    );
  }

  if (field.name === "familySize") {
    return renderSelect(
      fieldId,
      field.name,
      field.label,
      row.familySize,
      familySizeOptions,
      "Select family size",
      selectClass,
      (e) => onRowChange(rowIndex, e)
    );
  }

  return (
    <input
      id={fieldId}
      name={field.name}
      aria-label={field.label}
      type={field.type ?? "text"}
      required={field.required}
      value={row[field.name]}
      onChange={(e) => onRowChange(rowIndex, e)}
      className={`${fieldInputClass} min-w-[120px]`}
    />
  );
}

export function PremiumRatesForm({
  rows,
  benefitOptions,
  businessClass,
  onRowChange,
  onAddRow,
  onRemoveRow,
  fieldInputClass,
}: PremiumRatesFormProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-1.5">
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div>
          <h3 className="text-[12px] font-bold uppercase text-slate-700">Premium Rates</h3>
          <p className="text-[12px] text-slate-500">
            Capture Premiums and contributions.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onAddRow}>
          Add Premium Rate
        </Button>
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
                {premiumRateFields.map((field) => (
                  <th
                    key={field.name}
                    className={thClass}
                    style={{ minWidth: columnMinWidth }}
                  >
                    {field.label}
                  </th>
                ))}
                <th
                  className={thClass}
                  style={{ width: removeColumnWidth, minWidth: removeColumnWidth }}
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.idx ?? `new-${rowIndex}`} className="bg-white">
                  {premiumRateFields.map((field) => (
                    <td
                      key={field.name}
                      className={tdClass}
                      style={{ minWidth: columnMinWidth }}
                    >
                      {renderCell(
                        field,
                        row,
                        rowIndex,
                        benefitOptions,
                        businessClass,
                        onRowChange,
                        fieldInputClass
                      )}
                    </td>
                  ))}
                  <td
                    className={tdClass}
                    style={{ width: removeColumnWidth, minWidth: removeColumnWidth }}
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => onRemoveRow(rowIndex)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
