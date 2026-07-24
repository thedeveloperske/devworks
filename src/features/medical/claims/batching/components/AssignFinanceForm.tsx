"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import {
  defaultAssignFinanceForm,
  type AssignFinanceFormData,
} from "@/features/medical/claims/batching/assign-finance-types";
import type { LookupOption } from "@/features/medical/lookups/types";
import { labelClass } from "@/lib/form-styles";

type AssignFinanceFormProps = {
  batchId: string;
  batchNo: string;
  authorizerName: string;
  userOptions: LookupOption[];
  initial?: Partial<AssignFinanceFormData>;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const compactInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

function userSelectOptions(
  users: LookupOption[],
  currentValue: string
): LookupOption[] {
  const options = [{ value: "", label: "Select user..." }, ...users];
  if (currentValue && !users.some((option) => option.value === currentValue)) {
    options.push({ value: currentValue, label: currentValue });
  }
  return options;
}

export function AssignFinanceForm({
  batchId,
  batchNo,
  authorizerName,
  userOptions,
  initial,
  embedded = false,
  onSuccess,
  onCancel,
}: AssignFinanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AssignFinanceFormData>(() => ({
    ...defaultAssignFinanceForm(),
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

    const res = await fetch(`/api/medical/claims/batches/${batchId}/assign-finance`, {
      method: "PATCH",
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
    : "max-w-md space-y-4 border border-slate-200 bg-white p-6";

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <div className={embedded ? "min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" : "space-y-3"}>
        <p className="text-[12px] text-slate-600">
          Assign batch <span className="font-semibold text-slate-900">{batchNo}</span> to
          finance. Current authorizer:{" "}
          <span className="font-semibold text-slate-900">{authorizerName}</span>.
        </p>
        <FormField
          id="financeUser"
          name="financeUser"
          label="Finance user"
          as="select"
          required
          value={form.financeUser}
          onChange={handleChange}
          options={userSelectOptions(userOptions, form.financeUser)}
          labelClassName={labelClass}
          inputClassName={compactInputClass}
        />
        <FormField
          id="assignedDate"
          name="assignedDate"
          label="Assignment Date"
          type="date"
          required
          value={form.assignedDate}
          onChange={handleChange}
          labelClassName={labelClass}
          inputClassName={compactInputClass}
        />
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
          {loading ? "Assigning..." : "Assign Finance"}
        </Button>
      </div>
    </form>
  );
}
