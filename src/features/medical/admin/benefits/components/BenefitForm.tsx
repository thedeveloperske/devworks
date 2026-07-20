"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import { inputClass, labelClass } from "@/lib/form-styles";
import { beneClassOptions } from "@/features/medical/lookups";
import {
  benefitFieldNames,
  defaultBenefitForm,
  getBenefitFields,
  type BenefitFormData,
} from "@/features/medical/admin/benefits";

type BenefitFormProps = {
  initial?: Partial<BenefitFormData>;
  benefitId?: string;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function BenefitForm({
  initial,
  benefitId,
  embedded = false,
  onSuccess,
  onCancel,
}: BenefitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<BenefitFormData>({
    ...defaultBenefitForm,
    ...initial,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = benefitId ? `/api/medical/benefits/${benefitId}` : "/api/medical/benefits";
    const method = benefitId ? "PUT" : "POST";

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
      router.push("/admin/medical/selection-items/benefits?manage=1");
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
        {getBenefitFields(benefitFieldNames).map((field) => (
          <FormField
            key={field.name}
            id={field.name}
            name={field.name}
            label={field.label}
            as={field.name === "beneClass" ? "select" : "input"}
            type={field.type ?? "text"}
            required={field.required}
            value={form[field.name]}
            onChange={handleChange}
            inputClassName={fieldInputClass}
            selectClassName={`${fieldInputClass} h-[30px]`}
            labelClassName={fieldLabelClass}
            options={
              field.name === "beneClass"
                ? [{ value: "", label: "Select bene class" }, ...beneClassOptions]
                : undefined
            }
          />
        ))}
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
        {loading ? "Saving..." : benefitId ? "Update Benefit" : "Create Benefit"}
      </Button>
      {onCancel ? (
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      ) : (
        <ButtonLink href="/admin/medical/selection-items/benefits?manage=1" variant="secondary" size="sm">
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
