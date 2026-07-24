"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import {
  defaultPreAuthorizationForm,
  getDateReportedCoverPeriodError,
  getPreAuthorizationFields,
  preAuthorizationFormSections,
  type PreAuthorizationField,
  type PreAuthorizationFormData,
  type PreAuthorizationMemberBenefitOption,
  type PreAuthorizationMemberCoverPeriod,
} from "@/features/medical/care/pre-authorization";
import type { LookupOption } from "@/features/medical/lookups/types";
import { formatThousands } from "@/lib/format";
import { inputClass, labelClass } from "@/lib/form-styles";

type PreAuthorizationFormProps = {
  initial?: Partial<PreAuthorizationFormData>;
  preAuthorizationId?: string;
  providerOptions: LookupOption[];
  hospitalWardOptions: LookupOption[];
  /** Member benefits for the selected member (all anniversaries). */
  memberBenefits?: PreAuthorizationMemberBenefitOption[];
  /** Cover periods from member_anniversary for the selected member. */
  coverPeriods?: PreAuthorizationMemberCoverPeriod[];
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
  memberBenefits = [],
  coverPeriods = [],
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

  const anniversaryBenefits = useMemo(() => {
    const anniv = form.anniv.trim();
    if (!anniv) return memberBenefits;
    return memberBenefits.filter((benefit) => benefit.anniv === anniv);
  }, [form.anniv, memberBenefits]);

  const activeCoverPeriod = useMemo(() => {
    const anniv = form.anniv.trim();
    if (!anniv) return null;
    return coverPeriods.find((period) => period.anniv === anniv) ?? null;
  }, [coverPeriods, form.anniv]);

  const dateReportedCoverError = useMemo(
    () =>
      getDateReportedCoverPeriodError(form.dateReported, activeCoverPeriod),
    [activeCoverPeriod, form.dateReported]
  );

  const authorityTypeOptions = useMemo(
    () =>
      anniversaryBenefits.map((benefit) => ({
        value: benefit.benefit,
        label: benefit.label,
      })),
    [anniversaryBenefits]
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof PreAuthorizationFormData;

    if (fieldName === "anniv") {
      setForm((prev) => {
        const nextAnnivBenefits = memberBenefits.filter(
          (benefit) => benefit.anniv === value.trim()
        );
        const authorityStillValid = nextAnnivBenefits.some(
          (benefit) => benefit.benefit === prev.authorityType
        );
        return {
          ...prev,
          anniv: value,
          authorityType: authorityStillValid ? prev.authorityType : "",
          ...(authorityStillValid
            ? {}
            : {
                availableLimit: "",
                bedLimit: "",
                ward: "",
              }),
        };
      });
      return;
    }

    if (fieldName === "authorityType") {
      const selected = anniversaryBenefits.find(
        (benefit) => benefit.benefit === value
      );
      setForm((prev) => ({
        ...prev,
        authorityType: value,
        availableLimit: selected
          ? formatThousands(selected.policyLimit)
          : "",
        bedLimit: selected ? formatThousands(selected.bedLimit) : "",
        ward: selected?.hospitalWard ?? "",
      }));
      return;
    }

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

    const coverError = getDateReportedCoverPeriodError(
      form.dateReported,
      activeCoverPeriod
    );
    if (coverError) {
      setError(coverError);
      setLoading(false);
      return;
    }

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
    ? "grid grid-cols-1 gap-x-3 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-12"
    : "grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3";

  const fieldLabelClass = embedded
    ? "mb-0.5 block text-[12px] font-medium text-slate-700"
    : labelClass;
  const fieldInputClass = embedded
    ? "w-full min-w-0 border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
    : inputClass;

  const renderField = (field: PreAuthorizationField) => {
    const isAuthorityType = field.name === "authorityType";
    const isSelect = field.as === "select" || isAuthorityType;
    const isTextarea = field.as === "textarea";
    const options = isAuthorityType
      ? [
          {
            value: "",
            label:
              authorityTypeOptions.length > 0
                ? "Select benefit"
                : "No benefits for this anniversary",
          },
          ...authorityTypeOptions,
        ]
      : field.name === "provider"
        ? [{ value: "", label: "Select provider" }, ...providerOptions]
        : field.name === "ward"
          ? [{ value: "", label: "Select ward" }, ...hospitalWardOptions]
          : undefined;

    return (
      <div key={field.name} className={`min-w-0 ${field.className ?? ""}`}>
        <FormField
          id={field.name}
          name={field.name}
          label={field.label}
          as={isTextarea ? "textarea" : isSelect ? "select" : "input"}
          type={field.type ?? "text"}
          required={field.required}
          value={form[field.name]}
          onChange={handleChange}
          disabled={
            (lockMemberNo && field.name === "memberNo") ||
            (isAuthorityType && authorityTypeOptions.length === 0)
          }
          min={
            field.name === "dateReported"
              ? activeCoverPeriod?.startDate || undefined
              : undefined
          }
          max={
            field.name === "dateReported"
              ? activeCoverPeriod?.endDate || undefined
              : undefined
          }
          hint={
            field.name === "dateReported" ? dateReportedCoverError ?? undefined : undefined
          }
          hintClassName={
            field.name === "dateReported" && dateReportedCoverError
              ? "mt-0.5 text-[11px] text-red-600"
              : undefined
          }
          inputClassName={
            amountFields.has(field.name)
              ? `${fieldInputClass} text-right`
              : lockMemberNo && field.name === "memberNo"
                ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
                : field.name === "dateReported" && dateReportedCoverError
                  ? `${fieldInputClass} border-red-400`
                  : fieldInputClass
          }
          selectClassName={`${fieldInputClass} h-[30px]${
            isAuthorityType && authorityTypeOptions.length === 0
              ? " cursor-not-allowed bg-slate-50 text-slate-600"
              : ""
          }`}
          labelClassName={fieldLabelClass}
          rows={isTextarea ? 3 : undefined}
          options={options}
        />
      </div>
    );
  };

  const formBody = (
    <>
      <FormError message={error} />
      <div className="space-y-4">
        {preAuthorizationFormSections.map((section) => {
          const fields = getPreAuthorizationFields(section.fields);
          if (fields.length === 0) return null;
          return (
            <section key={section.title} className="min-w-0 space-y-1.5">
              <h3 className="border-b border-slate-200 pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                {section.title}
              </h3>
              <div className={fieldGrid}>{fields.map(renderField)}</div>
            </section>
          );
        })}
      </div>
    </>
  );

  const actions = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      {embedded ? (
        <>
          {onCancel ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          ) : null}
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading
              ? "Saving..."
              : preAuthorizationId
                ? "Update Pre-authorization"
                : "Create Pre-authorization"}
          </Button>
        </>
      ) : (
        <>
          <ButtonLink
            href="/admin/medical/care/pre-authorization?manage=1"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Cancel
          </ButtonLink>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading
              ? "Saving..."
              : preAuthorizationId
                ? "Update Pre-authorization"
                : "Create Pre-authorization"}
          </Button>
        </>
      )}
    </div>
  );

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-1">
          {formBody}
        </div>
        <div className="mt-3 shrink-0 border-t border-slate-200 pt-3">
          {actions}
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      {formBody}
      <div className="mt-6">{actions}</div>
    </form>
  );
}
