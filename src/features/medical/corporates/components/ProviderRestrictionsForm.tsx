"use client";

import { Button } from "@/components/admin/Button";
import { providerRestrictionFields } from "@/features/medical/corporates";
import type { ProviderRestrictionFormData } from "@/features/medical/corporates";
import type { LookupOption } from "@/features/medical/lookups/types";

type ProviderRestrictionsFormProps = {
  rows: ProviderRestrictionFormData[];
  coverDateAnniv: string;
  providerOptions: LookupOption[];
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
  showHeader?: boolean;
};

const annivColumnWidth = 72;
const providerColumnMinWidth = 200;
const removeColumnWidth = 88;
const tableMinWidth =
  annivColumnWidth + providerColumnMinWidth + removeColumnWidth;
const tableBodyMaxHeight = 280;

function getColumnStyle(fieldName: (typeof providerRestrictionFields)[number]["name"]) {
  if (fieldName === "anniv") {
    return { width: annivColumnWidth, minWidth: annivColumnWidth };
  }
  return { minWidth: providerColumnMinWidth };
}

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";

function renderCell(
  field: (typeof providerRestrictionFields)[number],
  row: ProviderRestrictionFormData,
  rowIndex: number,
  coverDateAnniv: string,
  providerOptions: LookupOption[],
  onRowChange: ProviderRestrictionsFormProps["onRowChange"],
  fieldInputClass: string
) {
  const fieldId = `provider-${rowIndex}-${field.name}`;

  if (field.name === "anniv") {
    return (
      <input
        id={fieldId}
        name={field.name}
        aria-label={field.label}
        type="number"
        value={coverDateAnniv || "1"}
        onChange={() => undefined}
        disabled
        className={`${fieldInputClass} w-full cursor-not-allowed bg-slate-50 text-slate-600`}
      />
    );
  }

  return (
    <select
      id={fieldId}
      name={field.name}
      aria-label={field.label}
      required={field.required}
      value={row.provider}
      onChange={(e) => onRowChange(rowIndex, e)}
      className={`${fieldInputClass} h-[30px] w-full`}
    >
      <option value="">Select provider</option>
      {providerOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ProviderRestrictionsForm({
  rows,
  coverDateAnniv,
  providerOptions,
  onRowChange,
  onAddRow,
  onRemoveRow,
  fieldInputClass,
  showHeader = true,
}: ProviderRestrictionsFormProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-1.5">
      <div className="flex shrink-0 items-start justify-between gap-2">
        {showHeader ? (
          <div>
            <h3 className="text-[12px] font-bold uppercase text-slate-700">
              Provider Restrictions
            </h3>
            <p className="text-[12px] text-slate-500">
              Restrict providers for this corporate.
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button type="button" size="sm" variant="secondary" onClick={onAddRow}>
          Add Provider
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
                {providerRestrictionFields.map((field) => (
                  <th
                    key={field.name}
                    className={thClass}
                    style={getColumnStyle(field.name)}
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
                  {providerRestrictionFields.map((field) => (
                    <td
                      key={field.name}
                      className={tdClass}
                      style={getColumnStyle(field.name)}
                    >
                      {renderCell(
                        field,
                        row,
                        rowIndex,
                        coverDateAnniv,
                        providerOptions,
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
