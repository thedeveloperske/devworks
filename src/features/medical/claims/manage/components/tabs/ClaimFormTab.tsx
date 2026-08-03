"use client";

import type { ChangeEvent } from "react";
import { FormField } from "@/components/admin/FormField";
import { Switch } from "@/components/admin/Switch";
import { visibleClaimFormTabFields } from "@/features/medical/claims/manage/claim-form-constants";
import type {
  ClaimFormTabData,
  ClaimLineItemFormData,
} from "@/features/medical/claims/manage/types";
import { inputClass, labelClass } from "@/lib/form-styles";
import { ClaimLineItemsTable } from "./ClaimLineItemsTable";

const datesOnOrAfterInvoice = new Set([
  "doctorDate",
  "dateAdmitted",
  "dateDischarged",
]);

type ClaimFormTabProps = {
  value: ClaimFormTabData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  lineItems: ClaimLineItemFormData[];
  onLineItemChange: (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
  invoiceDate?: string;
};

export function ClaimFormTab({
  value,
  onChange,
  lineItems,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
  invoiceDate = "",
}: ClaimFormTabProps) {
  const invoiceDateMin = invoiceDate.trim();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-6">
        {visibleClaimFormTabFields.map((field) => {
          const needsInvoiceDate = datesOnOrAfterInvoice.has(field.name);
          const disabled = needsInvoiceDate && !invoiceDateMin;
          const min = needsInvoiceDate
            ? invoiceDateMin || undefined
            : undefined;

          return (
            <div key={field.name} className={field.className ?? "sm:col-span-2"}>
              {field.as === "switch" ? (
                <Switch
                  id={`claim-form-${field.name}`}
                  name={field.name}
                  label={field.label}
                  checked={value[field.name] === "1"}
                  onChange={onChange}
                  labelClassName={labelClass}
                />
              ) : (
                <FormField
                  id={`claim-form-${field.name}`}
                  name={field.name}
                  label={field.label}
                  value={value[field.name]}
                  onChange={onChange}
                  required={field.required}
                  type={field.type ?? "text"}
                  as={field.as ?? "input"}
                  rows={field.rows}
                  disabled={disabled}
                  min={min}
                  labelClassName={labelClass}
                  inputClassName={inputClass}
                />
              )}
            </div>
          );
        })}
      </div>

      <ClaimLineItemsTable
        rows={lineItems}
        onRowChange={onLineItemChange}
        onAddRow={onAddLineItem}
        onRemoveRow={onRemoveLineItem}
      />
    </div>
  );
}
