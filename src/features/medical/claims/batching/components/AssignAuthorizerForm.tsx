"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import {
  defaultAssignAuthorizerForm,
  type AssignAuthorizerFormData,
} from "@/features/medical/claims/batching/assign-authorizer-types";
import { labelClass } from "@/lib/form-styles";

type AssignAuthorizerFormProps = {
  batchId: string;
  batchNo: string;
  vetterName: string;
  initial?: Partial<AssignAuthorizerFormData>;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const compactInputClass =
  "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none";

export function AssignAuthorizerForm({
  batchId,
  batchNo,
  vetterName,
  initial,
  embedded = false,
  onSuccess,
  onCancel,
}: AssignAuthorizerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AssignAuthorizerFormData>(() => ({
    ...defaultAssignAuthorizerForm(),
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

    const res = await fetch(`/api/medical/claims/batches/${batchId}/assign-authorizer`, {
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
          Assign batch <span className="font-semibold text-slate-900">{batchNo}</span> to an
          authorizer. Current vetter:{" "}
          <span className="font-semibold text-slate-900">{vetterName}</span>.
        </p>
        <FormField
          id="authorizerUser"
          name="authorizerUser"
          label="Authorizer"
          required
          value={form.authorizerUser}
          onChange={handleChange}
          placeholder="Enter authorizer name"
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
          {loading ? "Assigning..." : "Assign Authorizer"}
        </Button>
      </div>
    </form>
  );
}
