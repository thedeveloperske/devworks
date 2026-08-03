"use client";

import type { ChangeEvent } from "react";
import { FormField } from "@/components/admin/FormField";
import { Switch } from "@/components/admin/Switch";
import { visibleClaimDetailsFields } from "@/features/medical/claims/manage/claim-details-constants";
import type { ClaimDetailsFormData } from "@/features/medical/claims/manage/types";
import type { LookupOption } from "@/features/medical/lookups/types";
import { inputClass, labelClass } from "@/lib/form-styles";

type ClaimDetailsTabProps = {
  value: ClaimDetailsFormData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  providerOptions: LookupOption[];
};

export function ClaimDetailsTab({
  value,
  onChange,
  providerOptions,
}: ClaimDetailsTabProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
        {visibleClaimDetailsFields.map((field) => {
          const options =
            field.name === "provider"
              ? [
                  { value: "", label: "Select provider" },
                  ...providerOptions,
                ]
              : undefined;

          return (
            <div key={field.name} className={field.className ?? "sm:col-span-2"}>
              {field.as === "switch" ? (
                <Switch
                  id={`claim-details-${field.name}`}
                  name={field.name}
                  label={field.label}
                  checked={value[field.name] === "1"}
                  onChange={onChange}
                  labelClassName={labelClass}
                />
              ) : (
                <FormField
                  id={`claim-details-${field.name}`}
                  name={field.name}
                  label={field.label}
                  value={value[field.name]}
                  onChange={onChange}
                  required={field.required}
                  type={field.type ?? "text"}
                  as={field.as ?? "input"}
                  rows={field.rows}
                  options={options}
                  labelClassName={labelClass}
                  inputClassName={inputClass}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
