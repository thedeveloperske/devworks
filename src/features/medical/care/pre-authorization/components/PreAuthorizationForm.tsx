"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import {
  defaultPreAuthorizationForm,
  getPreAuthorizationFields,
  preAuthorizationFieldNames,
  type PreAuthorizationFormData,
} from "@/features/medical/care/pre-authorization";
import type { LookupOption } from "@/features/medical/lookups/types";
import { formatThousands } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/form-styles";

type PreAuthorizationFormProps = {
  initial?: Partial<PreAuthorizationFormData>;
  preAuthorizationId?: string;
  providerOptions: LookupOption[];
  hospitalWardOptions: LookupOption[];
  lockMemberNo?: boolean;
  embedded?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const amountFields = new Set<keyof PreAuthorizationFormData>([
  "availableLimit",
  "reserve",
  "bedLimit",
]);

export function PreAuthorizationForm({
  initial,
  preAuthorizationId,
  providerOptions,
  hospitalWardOptions,
  lockMemberNo = false,
  embedded = false,
  onSuccess,
  onCancel,
}: PreAuthorizationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PreAuthorizationFormData>({
    ...defaultPreAuthorizationForm,
    ...initial,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof PreAuthorizationFormData;
    setForm((prev) => ({
      ...prev,
      [fieldName]: amountFields.has(fieldName)
        ? formatThousands(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = preAuthorizationId
      ? `/api/medical/care/pre-authorization/${preAuthorizationId}`
      : "/api/medical/care/pre-authorization";
    const method = preAuthorizationId ? "PUT" : "POST";

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

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/admin/medical/care/pre-authorization?manage=1");
      router.refresh();
    }
  };

  const formClassName = embedded
    ? "flex h-full min-h-0 flex-col"
    : "w-full space-y-6 border border-slate-200 bg-white p-6";

  const fieldGrid = embedded
    ? "grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3"
    : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

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
        {getPreAuthorizationFields(preAuthorizationFieldNames).map((field) => {
          const isSelect = field.as === "select";
          const isTextarea = field.as === "textarea";
          const options =
            field.name === "provider"
              ? [
                  { value: "", label: "Select provider" },
                  ...providerOptions,
                ]
              : field.name === "ward"
                ? [
                    { value: "", label: "Select ward" },
                    ...hospitalWardOptions,
                  ]
                : undefined;

          return (
            <FormField
              key={field.name}
              id={field.name}
              name={field.name}
              label={field.label}
              as={isTextarea ? "textarea" : isSelect ? "select" : "input"}
              type={field.type ?? "text"}
              required={field.required}
              value={form[field.name]}
              onChange={handleChange}
              disabled={lockMemberNo && field.name === "memberNo"}
              inputClassName={
                amountFields.has(field.name)
                  ? `${fieldInputClass} text-right`
                  : lockMemberNo && field.name === "memberNo"
                    ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
                    : fieldInputClass
              }
              selectClassName={`${fieldInputClass} h-[30px]`}
              labelClassName={fieldLabelClass}
              rows={isTextarea ? 2 : undefined}
              options={options}
            />
          );
        })}
      </div>
    </>
  );

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {formBody}
        </div>
        <div className="mt-3 flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-3">
          {onCancel ? (
            <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={loading}>
            {loading
              ? "Saving..."
              : preAuthorizationId
                ? "Update Pre-authorization"
                : "Create Pre-authorization"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {formBody}
      <div className="flex justify-end gap-2">
        <ButtonLink href="/admin/medical/care/pre-authorization?manage=1" variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : preAuthorizationId
              ? "Update Pre-authorization"
              : "Create Pre-authorization"}
        </Button>
      </div>
    </form>
  );
}
