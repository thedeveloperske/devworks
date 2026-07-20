"use client";

import { Button } from "@/components/admin/Button";
import { Switch } from "@/components/admin/Switch";
import { categoryGroupFields } from "@/features/medical/corporates";
import type { CategoryGroupFormData } from "@/features/medical/corporates";
import { benefitSharingOptions, fundOn } from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";

type CategoriesFormProps = {
  rows: CategoryGroupFormData[];
  benefitOptions: LookupOption[];
  categoryOptions: LookupOption[];
  coverDateAnniv: string;
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

const columnMinWidth = 120;
const annivColumnWidth = 72;
const removeColumnWidth = 88;
const tableMinWidth =
  (categoryGroupFields.length - 1) * columnMinWidth +
  annivColumnWidth +
  removeColumnWidth;
const tableBodyMaxHeight = 280;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";

function getColumnWidth(fieldName: (typeof categoryGroupFields)[number]["name"]) {
  return fieldName === "anniv" ? annivColumnWidth : columnMinWidth;
}

function renderSelect(
  id: string,
  name: string,
  label: string,
  value: string,
  options: LookupOption[],
  placeholder: string,
  className: string,
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  opts?: { required?: boolean }
) {
  return (
    <select
      id={id}
      name={name}
      aria-label={label}
      required={opts?.required}
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
  field: (typeof categoryGroupFields)[number],
  row: CategoryGroupFormData,
  rowIndex: number,
  benefitOptions: LookupOption[],
  categoryOptions: LookupOption[],
  coverDateAnniv: string,
  onRowChange: CategoriesFormProps["onRowChange"],
  fieldInputClass: string
) {
  const fieldId = `category-${rowIndex}-${field.name}`;
  const selectClass = `${fieldInputClass} h-[30px] min-w-[120px]`;

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

  if (field.name === "category") {
    return renderSelect(
      fieldId,
      field.name,
      field.label,
      row.category,
      categoryOptions,
      "Select category",
      selectClass,
      (e) => onRowChange(rowIndex, e),
      { required: field.required }
    );
  }

  if (field.name === "benefit" || field.name === "subLimitOf") {
    return renderSelect(
      fieldId,
      field.name,
      field.label,
      row[field.name],
      benefitOptions,
      field.name === "benefit" ? "Select benefit" : "Select sub limit of",
      selectClass,
      (e) => onRowChange(rowIndex, e)
    );
  }

  if (field.name === "fund") {
    return (
      <Switch
        id={fieldId}
        name={field.name}
        label={field.label}
        checked={row.fund === fundOn}
        onChange={(e) => onRowChange(rowIndex, e)}
        labelClassName="hidden"
      />
    );
  }

  if (field.name === "sharing") {
    return renderSelect(
      fieldId,
      field.name,
      field.label,
      row.sharing,
      benefitSharingOptions,
      "Select sharing",
      selectClass,
      (e) => onRowChange(rowIndex, e),
      { required: field.required }
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

export function CategoriesForm({
  rows,
  benefitOptions,
  categoryOptions,
  coverDateAnniv,
  onRowChange,
  onAddRow,
  onRemoveRow,
  fieldInputClass,
  showHeader = true,
}: CategoriesFormProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-1.5">
      <div className="flex shrink-0 items-start justify-between gap-2">
        {showHeader ? (
          <div>
            <h3 className="text-[12px] font-bold uppercase text-slate-700">Categories</h3>
            <p className="text-[12px] text-slate-500">
              Groups and Categorization
            </p>
          </div>
        ) : (
          <div />
        )}
        <Button type="button" size="sm" variant="secondary" onClick={onAddRow}>
          Add Category
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
                {categoryGroupFields.map((field) => (
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
                  style={{ width: removeColumnWidth, minWidth: removeColumnWidth }}
                >
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={row.idx ?? `new-${rowIndex}`} className="bg-white">
                  {categoryGroupFields.map((field) => (
                    <td
                      key={field.name}
                      className={tdClass}
                      style={{
                        width: getColumnWidth(field.name),
                        minWidth: getColumnWidth(field.name),
                      }}
                    >
                      {renderCell(
                        field,
                        row,
                        rowIndex,
                        benefitOptions,
                        categoryOptions,
                        coverDateAnniv,
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
