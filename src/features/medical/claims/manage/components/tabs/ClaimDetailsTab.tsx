"use client";

import type { ChangeEvent } from "react";
import { FormField } from "@/components/admin/FormField";
import { Switch } from "@/components/admin/Switch";
import {
  CLAIM_PAY_TO_PROXY,
  claimPayToOptions,
  visibleClaimDetailsFields,
} from "@/features/medical/claims/manage/claim-details-constants";
import type { ClaimDetailsFormData } from "@/features/medical/claims/manage/types";
import type { LookupOption } from "@/features/medical/lookups/types";
import { inputClass, labelClass } from "@/lib/form-styles";

type ClaimDetailsTabProps = {
  value: ClaimDetailsFormData;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  providerOptions: LookupOption[];
  claimNatureOptions: LookupOption[];
  invoiceDateMin?: string;
  invoiceDateMax?: string;
};

export function ClaimDetailsTab({
  value,
  onChange,
  providerOptions,
  claimNatureOptions,
  invoiceDateMin = "",
  invoiceDateMax = "",
}: ClaimDetailsTabProps) {
  const proxyPayeeEnabled = value.refund === CLAIM_PAY_TO_PROXY;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(e);
    if (e.target.name === "refund" && e.target.value !== CLAIM_PAY_TO_PROXY) {
      onChange({
        target: { name: "proxyPayee", value: "" },
      } as ChangeEvent<HTMLInputElement>);
    }
  };

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
              : field.name === "claimNature"
                ? [
                    {
                      value: "",
                      label: value.anniv
                        ? claimNatureOptions.length > 0
                          ? "Select claim nature"
                          : "No benefits for this anniversary"
                        : "Set invoice date first",
                    },
                    ...claimNatureOptions,
                  ]
                : field.name === "refund"
                  ? [...claimPayToOptions]
                  : undefined;

          const disabled =
            field.name === "proxyPayee"
              ? !proxyPayeeEnabled
              : field.name === "anniv"
                ? true
                : field.name === "claimNature"
                  ? !value.anniv || claimNatureOptions.length === 0
                  : false;

          const min =
            field.name === "invoiceDate" ? invoiceDateMin || undefined : undefined;
          const max =
            field.name === "invoiceDate" ? invoiceDateMax || undefined : undefined;

          return (
            <div key={field.name} className={field.className ?? "sm:col-span-2"}>
              {field.as === "switch" ? (
                <Switch
                  id={`claim-details-${field.name}`}
                  name={field.name}
                  label={field.label}
                  checked={value[field.name] === "1"}
                  onChange={handleChange}
                  labelClassName={labelClass}
                />
              ) : (
                <FormField
                  id={`claim-details-${field.name}`}
                  name={field.name}
                  label={field.label}
                  value={value[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  type={field.type ?? "text"}
                  as={field.as ?? "input"}
                  rows={field.rows}
                  options={options}
                  disabled={disabled}
                  min={min}
                  max={max}
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
