"use client";

import type { ChangeEvent } from "react";
import { FormField } from "@/components/admin/FormField";
import { claimFormTabFields } from "@/features/medical/claims/manage/claim-form-constants";
import type { ClaimFormTabData } from "@/features/medical/claims/manage/types";
import { inputClass, labelClass } from "@/lib/form-styles";

type ClaimFormTabProps = {
  value: ClaimFormTabData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
};

export function ClaimFormTab({ value, onChange }: ClaimFormTabProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
        {claimFormTabFields.map((field) => (
          <div key={field.name} className={field.className ?? "sm:col-span-2"}>
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
              labelClassName={labelClass}
              inputClassName={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
