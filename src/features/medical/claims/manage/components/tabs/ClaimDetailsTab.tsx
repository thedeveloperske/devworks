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
  serviceOptions: LookupOption[];
  claimNatureOptions: LookupOption[];
  batchNoOptions: LookupOption[];
  invoiceDateMin?: string;
  invoiceDateMax?: string;
  onManagePreAuth?: () => void;
  hasMatchingPreAuths?: boolean;
};

export function ClaimDetailsTab({
  value,
  onChange,
  providerOptions,
  serviceOptions,
  claimNatureOptions,
  batchNoOptions,
  invoiceDateMin = "",
  invoiceDateMax = "",
  onManagePreAuth,
  hasMatchingPreAuths = false,
}: ClaimDetailsTabProps) {
  const proxyPayeeEnabled = value.refund === CLAIM_PAY_TO_PROXY;
  const canManagePreAuth = Boolean(
    hasMatchingPreAuths &&
      value.claimNature.trim() &&
      value.provider.trim() &&
      value.anniv.trim() &&
      value.memberNo.trim()
  );

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
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {visibleClaimDetailsFields.map((field) => {
          // Fund is rendered beside Anniv in one column.
          if (field.name === "fund") return null;

          const options =
            field.name === "provider"
              ? [
                  { value: "", label: "Select provider" },
                  ...providerOptions,
                ]
              : field.name === "service"
                ? [
                    { value: "", label: "Select service" },
                    ...serviceOptions,
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
                : field.name === "batchNo"
                  ? [
                      {
                        value: "",
                        label: value.provider
                          ? batchNoOptions.length > 0
                            ? "Select batch"
                            : "No batches for this provider"
                          : "Select provider first",
                      },
                      ...batchNoOptions,
                    ]
                  : field.name === "refund"
                    ? [...claimPayToOptions]
                    : undefined;

          const dateReceivedDisabled =
            field.name === "dateReceived" && !value.invoiceDate.trim();

          const disabled =
            field.name === "proxyPayee"
              ? !proxyPayeeEnabled
              : field.name === "anniv" || field.name === "preAuthNo"
                ? true
                : field.name === "claimNature"
                  ? !value.anniv || claimNatureOptions.length === 0
                  : field.name === "batchNo"
                    ? !value.provider || batchNoOptions.length === 0
                    : dateReceivedDisabled;

          const min =
            field.name === "invoiceDate"
              ? invoiceDateMin || undefined
              : field.name === "dateReceived"
                ? value.invoiceDate.trim() || undefined
                : undefined;
          const max =
            field.name === "invoiceDate"
              ? invoiceDateMax || undefined
              : undefined;

          if (field.name === "anniv") {
            return (
              <div
                key="anniv-fund"
                className="grid grid-cols-2 gap-2 sm:col-span-1"
              >
                <FormField
                  id="claim-details-anniv"
                  name="anniv"
                  label="Anniv"
                  value={value.anniv}
                  onChange={handleChange}
                  type="number"
                  disabled
                  labelClassName={labelClass}
                  inputClassName={inputClass}
                />
                <div className="flex flex-col justify-end">
                  <Switch
                    id="claim-details-fund"
                    name="fund"
                    label="Fund"
                    checked={value.fund === "1"}
                    onChange={handleChange}
                    disabled
                    labelClassName={labelClass}
                  />
                </div>
              </div>
            );
          }

          if (field.name === "preAuthNo") {
            const attached = value.preAuthNo.trim();
            return (
              <div
                key={field.name}
                className={field.className ?? "sm:col-span-1"}
              >
                <span className={labelClass}>{field.label}</span>
                {onManagePreAuth ? (
                  <button
                    type="button"
                    id={`claim-details-${field.name}`}
                    disabled={!canManagePreAuth}
                    onClick={onManagePreAuth}
                    className={`block w-full border border-slate-300 px-2.5 py-1.5 text-left text-[11px] transition ${
                      canManagePreAuth
                        ? attached
                          ? "bg-white font-semibold text-maroon underline underline-offset-2 hover:bg-slate-50"
                          : "bg-white text-maroon underline underline-offset-2 hover:bg-slate-50"
                        : "cursor-not-allowed bg-slate-50 text-slate-400"
                    }`}
                  >
                    {attached || (canManagePreAuth ? "Select preauth" : "—")}
                  </button>
                ) : (
                  <input
                    id={`claim-details-${field.name}`}
                    name={field.name}
                    value={attached}
                    disabled
                    readOnly
                    className={inputClass}
                  />
                )}
              </div>
            );
          }

          return (
            <div key={field.name} className={field.className ?? "sm:col-span-1"}>
              {field.as === "switch" ? (
                <Switch
                  id={`claim-details-${field.name}`}
                  name={field.name}
                  label={field.label}
                  checked={value[field.name] === "1"}
                  onChange={handleChange}
                  disabled={disabled}
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
                  as={
                    field.as === "select" || field.as === "textarea"
                      ? field.as
                      : "input"
                  }
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
