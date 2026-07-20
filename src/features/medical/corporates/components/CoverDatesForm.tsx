"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import type { CoverDateFormData } from "@/features/medical/corporates";
import { coverDateFields } from "@/features/medical/corporates";
import type { LookupOption } from "@/features/medical/lookups/types";

type CoverDatesFormProps = {
  value: CoverDateFormData;
  corporateAgentId: string;
  agentOptions: LookupOption[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  fieldLabelClass: string;
  fieldInputClass: string;
  annivDisabled?: boolean;
  agentDisabled?: boolean;
  withTopBorder?: boolean;
  description?: string;
  showActions?: boolean;
  showHeader?: boolean;
};

const columnMinWidth = 120;
const annivColumnWidth = 72;
const actionsColumnWidth = 72;
const tableMinWidth =
  (coverDateFields.length - 1) * columnMinWidth +
  annivColumnWidth +
  actionsColumnWidth;

const thClass =
  "whitespace-nowrap border-b border-slate-200 px-2 py-1.5 text-left text-[12px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "border-b border-slate-200 px-1 py-1.5 align-middle";
const iconActionClass =
  "inline-flex h-7 w-7 items-center justify-center text-slate-500 transition-colors hover:text-maroon focus:outline-none focus-visible:ring-1 focus-visible:ring-maroon";

function getColumnWidth(fieldName: (typeof coverDateFields)[number]["name"]) {
  return fieldName === "anniv" ? annivColumnWidth : columnMinWidth;
}

function renderCell(
  field: (typeof coverDateFields)[number],
  value: CoverDateFormData,
  corporateAgentId: string,
  agentOptions: LookupOption[],
  onChange: CoverDatesFormProps["onChange"],
  fieldInputClass: string,
  annivDisabled: boolean,
  agentDisabled: boolean
) {
  const fieldId = `cover-${field.name}`;
  const selectClass = `${fieldInputClass} h-[30px] min-w-[120px]`;

  if (field.name === "agentId") {
    return (
      <select
        id={fieldId}
        name={field.name}
        aria-label={field.label}
        value={agentDisabled ? corporateAgentId : value.agentId}
        onChange={agentDisabled ? () => undefined : onChange}
        disabled={agentDisabled}
        className={
          agentDisabled
            ? `${selectClass} cursor-not-allowed bg-slate-50 text-slate-600`
            : selectClass
        }
      >
        <option value="">Select intermediary</option>
        {agentOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.name === "anniv") {
    return (
      <input
        id={fieldId}
        name={field.name}
        aria-label={field.label}
        type="number"
        value={value.anniv || "1"}
        onChange={annivDisabled ? () => undefined : onChange}
        disabled={annivDisabled}
        className={
          annivDisabled
            ? `${fieldInputClass} w-full cursor-not-allowed bg-slate-50 text-slate-600`
            : `${fieldInputClass} w-full`
        }
      />
    );
  }

  return (
    <input
      id={fieldId}
      name={field.name}
      aria-label={field.label}
      type={field.type ?? "text"}
      value={value[field.name]}
      onChange={onChange}
      className={`${fieldInputClass} min-w-[120px]`}
    />
  );
}

export function CoverDatesForm({
  value,
  corporateAgentId,
  agentOptions,
  onChange,
  fieldInputClass,
  annivDisabled = true,
  agentDisabled = true,
  withTopBorder = false,
  description = "Cover period.",
  showActions = true,
  showHeader = true,
}: CoverDatesFormProps) {
  const minWidth = showActions
    ? tableMinWidth
    : tableMinWidth - actionsColumnWidth;

  return (
    <section
      className={`space-y-1.5${withTopBorder ? " border-t border-slate-200 pt-2" : ""}`}
    >
      {showHeader ? (
        <div>
          <h3 className="text-[12px] font-bold uppercase text-slate-700">Cover Dates</h3>
          <p className="text-[12px] text-slate-500">{description}</p>
        </div>
      ) : null}
      <div className="overflow-x-auto border border-slate-200">
        <table
          className="w-full border-collapse"
          style={{ minWidth }}
        >
          <thead className="bg-slate-50">
            <tr>
              {coverDateFields.map((field) => (
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
              {showActions ? (
                <th
                  className={thClass}
                  style={{ width: actionsColumnWidth, minWidth: actionsColumnWidth }}
                >
                  <span className="sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              {coverDateFields.map((field) => (
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
                    value,
                    corporateAgentId,
                    agentOptions,
                    onChange,
                    fieldInputClass,
                    annivDisabled,
                    agentDisabled
                  )}
                </td>
              ))}
              {showActions ? (
                <td
                  className={tdClass}
                  style={{ width: actionsColumnWidth, minWidth: actionsColumnWidth }}
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <a
                      href="#"
                      title="Normalize"
                      aria-label="Normalize"
                      className={iconActionClass}
                      onClick={(e) => e.preventDefault()}
                    >
                      <RefreshCw className="h-4 w-4" aria-hidden />
                    </a>
                    <a
                      href="#"
                      title="Approve"
                      aria-label="Approve"
                      className={iconActionClass}
                      onClick={(e) => e.preventDefault()}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </td>
              ) : null}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
