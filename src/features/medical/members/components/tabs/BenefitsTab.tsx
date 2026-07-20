"use client";

import {
  getMemberBenefitFields,
  memberBenefitFieldNames,
  type MemberBenefitField,
  type MemberBenefitFormData,
} from "@/features/medical/members";
import { benefitSharingOptions } from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";

type BenefitsTabProps = {
  rows: MemberBenefitFormData[];
  benefitOptions: LookupOption[];
  fieldInputClass: string;
};

const visibleFields: MemberBenefitField[] =
  getMemberBenefitFields(memberBenefitFieldNames);

const columnMinWidth = 120;
const tableMinWidth = visibleFields.length * columnMinWidth;
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
  className: string
) {
  return (
    <select
      id={id}
      name={name}
      aria-label={label}
      value={value}
      onChange={() => undefined}
      disabled
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
  field: MemberBenefitField,
  row: MemberBenefitFormData,
  rowIndex: number,
  benefitOptions: LookupOption[],
  fieldInputClass: string
) {
  const fieldId = `member-benefit-${rowIndex}-${field.name}`;
  const disabledClass = `${fieldInputClass} h-[30px] min-w-[120px] cursor-not-allowed bg-slate-50 text-slate-600`;

  if (field.name === "memberNo") {
    return (
      <input
        id={fieldId}
        name={field.name}
        aria-label={field.label}
        type="text"
        value={row.memberNo}
        placeholder={row.memberNo ? undefined : "Assigned on create"}
        onChange={() => undefined}
        disabled
        className={`${fieldInputClass} w-full cursor-not-allowed bg-slate-50 text-slate-600`}
      />
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
      disabledClass
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
      disabledClass
    );
  }

  return (
    <input
      id={fieldId}
      name={field.name}
      aria-label={field.label}
      type={field.type ?? "text"}
      value={row[field.name]}
      onChange={() => undefined}
      disabled
      className={`${fieldInputClass} min-w-[120px] cursor-not-allowed bg-slate-50 text-slate-600`}
    />
  );
}

export function BenefitsTab({
  rows,
  benefitOptions,
  fieldInputClass,
}: BenefitsTabProps) {
  return (
    <section className="flex h-full min-h-0 flex-col gap-1.5">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">
          Benefits
        </h3>
        <p className="text-[12px] text-slate-500">Member Benefits.</p>
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
                  key={`${row.benefit || "new"}-${row.anniv || rowIndex}-${rowIndex}`}
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
                        benefitOptions,
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
