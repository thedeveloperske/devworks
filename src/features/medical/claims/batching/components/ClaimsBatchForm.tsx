"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import type { LookupOption } from "@/features/medical/lookups/types";
import {
  defaultClaimsBatchForm,
  type ClaimsBatchFormData,
} from "@/features/medical/claims/batching";
import { labelClass } from "@/lib/form-styles";

type ClaimsBatchFormProps = {
  batchId?: string;
  initial?: Partial<ClaimsBatchFormData>;
  providers: LookupOption[];
  currentUserName?: string;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const compactInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

const sectionTitleClass =
  "border-b border-slate-200 pb-1 text-[12px] font-bold uppercase tracking-wide text-slate-700";

const providerSelectOptions = (providers: LookupOption[]) => [
  { value: "", label: "Select provider..." },
  ...providers,
];

export function ClaimsBatchForm({
  batchId,
  initial,
  providers,
  currentUserName,
  embedded = false,
  onSuccess,
  onCancel,
}: ClaimsBatchFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<ClaimsBatchFormData>(() => ({
    ...defaultClaimsBatchForm(),
    batchUser: currentUserName ?? "",
    ...initial,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = batchId
      ? `/api/medical/claims/batches/${batchId}`
      : "/api/medical/claims/batches";
    const method = batchId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    onSuccess?.();
  };

  const formClassName = embedded
    ? "flex h-full min-h-0 flex-col"
    : "max-w-3xl space-y-5 border border-slate-200 bg-white p-6";

  const isEdit = Boolean(batchId);

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <div className={embedded ? "min-h-0 flex-1 space-y-4 overflow-y-auto pr-1" : "space-y-4"}>
        <div className="space-y-3">
          <h3 className={sectionTitleClass}>Batch details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              id="batchNo"
              name="batchNo"
              label="Batch No"
              value={form.batchNo}
              onChange={handleChange}
              placeholder={isEdit ? "" : "Auto-generated as BAT-n"}
              labelClassName={labelClass}
              inputClassName={compactInputClass}
            />
            <FormField
              id="batchDate"
              name="batchDate"
              label="Batch Date"
              type="date"
              required
              value={form.batchDate}
              onChange={handleChange}
              labelClassName={labelClass}
              inputClassName={compactInputClass}
            />
            <FormField
              id="provider"
              name="provider"
              label="Provider"
              as="select"
              required
              value={form.provider}
              onChange={handleChange}
              options={providerSelectOptions(providers)}
              labelClassName={labelClass}
              inputClassName={compactInputClass}
            />
            <FormField
              id="dateReceived"
              name="dateReceived"
              label="Date Received"
              type="date"
              required
              value={form.dateReceived}
              onChange={handleChange}
              labelClassName={labelClass}
              inputClassName={compactInputClass}
            />
            <FormField
              id="claimsCount"
              name="claimsCount"
              label="Claims Count"
              type="number"
              value={form.claimsCount}
              onChange={handleChange}
              labelClassName={labelClass}
              inputClassName={compactInputClass}
            />
            <FormField
              id="batchUser"
              name="batchUser"
              label="Batch User"
              value={form.batchUser}
              onChange={handleChange}
              labelClassName={labelClass}
              inputClassName={compactInputClass}
            />
          </div>
        </div>

        {isEdit ? (
          <>
            <div className="space-y-3">
              <h3 className={sectionTitleClass}>Entrant assignment</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  id="dataEntryUser"
                  name="dataEntryUser"
                  label="Entrant"
                  value={form.dataEntryUser}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
                <FormField
                  id="dateEntryDate"
                  name="dateEntryDate"
                  label="Assignment Date"
                  type="date"
                  value={form.dateEntryDate}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={sectionTitleClass}>Vetter assignment</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  id="vettingUser"
                  name="vettingUser"
                  label="Vetter"
                  value={form.vettingUser}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
                <FormField
                  id="vettingUserDate"
                  name="vettingUserDate"
                  label="Assignment Date"
                  type="date"
                  value={form.vettingUserDate}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={sectionTitleClass}>Authorizer assignment</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  id="authorisingUser"
                  name="authorisingUser"
                  label="Authorizer"
                  value={form.authorisingUser}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
                <FormField
                  id="authorisingUserDate"
                  name="authorisingUserDate"
                  label="Assignment Date"
                  type="date"
                  value={form.authorisingUserDate}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={sectionTitleClass}>Finance</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  id="financeUser"
                  name="financeUser"
                  label="Finance User"
                  value={form.financeUser}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
                <FormField
                  id="financeUserDate"
                  name="financeUserDate"
                  label="Finance Date"
                  type="date"
                  value={form.financeUserDate}
                  onChange={handleChange}
                  labelClassName={labelClass}
                  inputClassName={compactInputClass}
                />
              </div>
            </div>
          </>
        ) : null}
      </div>

      {error ? <FormError message={error} className="mt-3 shrink-0" /> : null}

      <div
        className={
          embedded
            ? "mt-3 flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-3"
            : "flex justify-end gap-2 pt-2"
        }
      >
        {onCancel ? (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Save Batch" : "Create Batch"}
        </Button>
      </div>
    </form>
  );
}
