"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import { inputClass, labelClass } from "@/lib/form-styles";
import {
  defaultHospitalWardForm,
  getHospitalWardFields,
  hospitalWardFieldNames,
  type HospitalWardFormData,
} from "@/features/medical/admin/hospital-wards";

type HospitalWardFormProps = {
  initial?: Partial<HospitalWardFormData>;
  wardId?: string;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function HospitalWardForm({
  initial,
  wardId,
  embedded = false,
  onSuccess,
  onCancel,
}: HospitalWardFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<HospitalWardFormData>({
    ...defaultHospitalWardForm,
    ...initial,
  });

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

    const url = wardId
      ? `/api/medical/hospital-wards/${encodeURIComponent(wardId)}`
      : "/api/medical/hospital-wards";
    const method = wardId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/admin/medical/selection-items/hospital-ward?manage=1");
      router.refresh();
    }
  };

  const formClassName = embedded
    ? "flex h-full min-h-0 flex-col"
    : "w-full space-y-6 border border-slate-200 bg-white p-6";

  const fieldGrid = embedded
    ? "grid gap-1.5 sm:grid-cols-2"
    : "grid gap-4 sm:grid-cols-2";

  const fieldLabelClass = embedded
    ? "mb-0.5 block text-[12px] font-medium text-slate-700"
    : labelClass;
  const fieldInputClass = embedded
    ? "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
    : inputClass;

  const formBody = (
    <>
      <FormError message={error} />
      <div className={fieldGrid}>
        {getHospitalWardFields(hospitalWardFieldNames).map((field) => {
          const isCodeLocked = Boolean(wardId) && field.name === "code";
          return (
            <FormField
              key={field.name}
              id={field.name}
              name={field.name}
              label={field.label}
              type={field.type ?? "text"}
              required={field.required}
              value={form[field.name]}
              onChange={handleChange}
              disabled={isCodeLocked}
              placeholder={field.placeholder}
              inputClassName={
                isCodeLocked
                  ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
                  : fieldInputClass
              }
              labelClassName={fieldLabelClass}
            />
          );
        })}
      </div>
    </>
  );

  const formActions = (
    <div
      className={`flex gap-3 ${
        embedded
          ? "shrink-0 justify-center border-t border-slate-200 bg-white pt-1.5"
          : "border-t border-slate-200 pt-4"
      }`}
    >
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Saving..." : wardId ? "Update Ward" : "Create Ward"}
      </Button>
      {onCancel ? (
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      ) : (
        <ButtonLink
          href="/admin/medical/selection-items/hospital-ward?manage=1"
          variant="secondary"
          size="sm"
        >
          Cancel
        </ButtonLink>
      )}
    </div>
  );

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="flex min-h-0 flex-1 flex-col space-y-1.5 overflow-hidden p-2">
          {formBody}
        </div>
        {formActions}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {formBody}
      {formActions}
    </form>
  );
}
