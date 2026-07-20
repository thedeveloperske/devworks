"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoverDatesForm } from "./CoverDatesForm";
import { ContactPersonForm } from "./ContactPersonForm";
import { CategoriesForm } from "./CategoriesForm";
import { ProviderRestrictionsForm } from "./ProviderRestrictionsForm";
import { PremiumRatesForm } from "./PremiumRatesForm";
import { Button, ButtonLink } from "@/components/admin/Button";
import { FormError } from "@/components/admin/FormError";
import { FormField } from "@/components/admin/FormField";
import { inputClass, labelClass } from "@/lib/form-styles";
import {
  branchOptions,
  businessClassOptions,
  channelOptions,
  currencyOptions,
  townOptions,
  type LookupOption,
} from "@/features/medical/lookups";
import {
  corporateFieldNames,
  corporateTabs,
  createEmptyCategoryGroupRow,
  createEmptyContactPersonRow,
  createEmptyProviderRestrictionRow,
  createEmptyPremiumRateRow,
  defaultCorporateForm,
  defaultCoverDateForm,
  deriveCoverDatesFromStart,
  deriveRenewalDateFromEnd,
  validateCoverDateOrder,
  getCorporateFields,
  type CorporateField,
  type CorporateFormData,
  type CorporateTabId,
  type CategoryGroupFormData,
  type ContactPersonFormData,
  type CoverDateFormData,
  type ProviderRestrictionFormData,
  type PremiumRateFormData,
} from "@/features/medical/corporates";

type CorporateFormProps = {
  initial?: Partial<CorporateFormData>;
  initialCoverDates?: Partial<CoverDateFormData>;
  initialContactPersons?: ContactPersonFormData[];
  initialCategoryGroups?: CategoryGroupFormData[];
  initialProviderRestrictions?: ProviderRestrictionFormData[];
  initialPremiumRates?: PremiumRateFormData[];
  corporateId?: string;
  embedded?: boolean;
  agentOptions: LookupOption[];
  benefitOptions: LookupOption[];
  categoryOptions: LookupOption[];
  providerOptions: LookupOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CorporateForm({
  initial,
  initialCoverDates,
  initialContactPersons,
  initialCategoryGroups,
  initialProviderRestrictions,
  initialPremiumRates,
  corporateId,
  embedded = false,
  agentOptions,
  benefitOptions,
  categoryOptions,
  providerOptions,
  onSuccess,
  onCancel,
}: CorporateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CorporateFormData>({
    ...defaultCorporateForm,
    ...initial,
  });
  const [coverDateForm, setCoverDateForm] =
    useState<CoverDateFormData>({
      ...defaultCoverDateForm,
      ...initialCoverDates,
    });
  const [contactPersonRows, setContactPersonRows] = useState<ContactPersonFormData[]>(
    initialContactPersons?.length
      ? initialContactPersons
      : [createEmptyContactPersonRow()]
  );
  const [categoryGroupRows, setCategoryGroupRows] = useState<CategoryGroupFormData[]>(
    initialCategoryGroups?.length
      ? initialCategoryGroups
      : [createEmptyCategoryGroupRow()]
  );
  const [providerRestrictionRows, setProviderRestrictionRows] = useState<
    ProviderRestrictionFormData[]
  >(
    initialProviderRestrictions?.length
      ? initialProviderRestrictions
      : [createEmptyProviderRestrictionRow()]
  );
  const [premiumRateRows, setPremiumRateRows] = useState<PremiumRateFormData[]>(
    initialPremiumRates?.length
      ? initialPremiumRates
      : [createEmptyPremiumRateRow()]
  );
  const [activeTab, setActiveTab] = useState<CorporateTabId>("corporate");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "scheme" ? value.toUpperCase() : value,
    }));
  };

  const handleCoverDateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCoverDateForm((prev) => {
      if (name === "startDate") {
        const derived = deriveCoverDatesFromStart(value);
        return {
          ...prev,
          startDate: value,
          endDate: derived.endDate,
          renewalDate: derived.renewalDate,
        };
      }
      if (name === "endDate") {
        return {
          ...prev,
          endDate: value,
          renewalDate: deriveRenewalDateFromEnd(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleContactPersonRowChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setContactPersonRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [name]: value,
            }
          : row
      )
    );
  };

  const handleAddContactPersonRow = () => {
    setContactPersonRows((prev) => [...prev, createEmptyContactPersonRow()]);
  };

  const handleRemoveContactPersonRow = (index: number) => {
    setContactPersonRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleCategoryGroupRowChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCategoryGroupRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [name]: name === "category" ? value.toUpperCase() : value,
            }
          : row
      )
    );
  };

  const handleAddCategoryGroupRow = () => {
    setCategoryGroupRows((prev) => [...prev, createEmptyCategoryGroupRow()]);
  };

  const handleRemoveCategoryGroupRow = (index: number) => {
    setCategoryGroupRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleProviderRestrictionRowChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProviderRestrictionRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [name]: value,
            }
          : row
      )
    );
  };

  const handleAddProviderRestrictionRow = () => {
    setProviderRestrictionRows((prev) => [...prev, createEmptyProviderRestrictionRow()]);
  };

  const handleRemoveProviderRestrictionRow = (index: number) => {
    setProviderRestrictionRows((prev) =>
      prev.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const handlePremiumRateRowChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setPremiumRateRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [name]: value,
            }
          : row
      )
    );
  };

  const handleAddPremiumRateRow = () => {
    setPremiumRateRows((prev) => [...prev, createEmptyPremiumRateRow()]);
  };

  const handleRemovePremiumRateRow = (index: number) => {
    setPremiumRateRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const coverDateOrderError = validateCoverDateOrder({
      startDate: coverDateForm.startDate,
      endDate: coverDateForm.endDate,
      renewalDate: coverDateForm.renewalDate,
    });
    if (coverDateOrderError) {
      setError(coverDateOrderError);
      setLoading(false);
      return;
    }

    const url = corporateId ? `/api/medical/corporates/${corporateId}` : "/api/medical/corporates";
    const method = corporateId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverDates: {
          startDate: coverDateForm.startDate,
          endDate: coverDateForm.endDate,
          renewalDate: coverDateForm.renewalDate,
          anniv: coverDateForm.anniv || "1",
        },
        contactPersons: contactPersonRows.map((row) => ({
          idx: row.idx,
          title: row.title,
          surname: row.surname,
          firstName: row.firstName,
          otherNames: row.otherNames,
          jobTitle: row.jobTitle,
          mobileNo: row.mobileNo,
          telNo: row.telNo,
          email: row.email,
        })),
        categoryGroups: categoryGroupRows.map((row) => ({
          idx: row.idx,
          anniv: coverDateForm.anniv || "1",
          category: row.category,
          benefit: row.benefit,
          fund: row.fund,
          policyLimit: row.policyLimit,
          subLimitOf: row.subLimitOf,
          sharing: row.sharing,
          copayAmount: row.copayAmount,
          waitingPeriod: row.waitingPeriod,
        })),
        providerRestrictions: providerRestrictionRows.map((row) => ({
          idx: row.idx,
          provider: row.provider,
          anniv: coverDateForm.anniv || "1",
        })),
        premiumRates: premiumRateRows.map((row) => ({
          idx: row.idx,
          benefit: row.benefit,
          premiumType: form.businessClass,
          familySize: row.familySize,
          policyLimit: row.policyLimit,
          premium: row.premium,
          minAge: row.minAge,
          maxAge: row.maxAge,
        })),
      }),
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
      router.push("/admin/medical/corporates?manage=1");
      router.refresh();
    }
  };

  const formClassName = embedded
    ? "flex h-full min-h-0 flex-col"
    : "w-full space-y-6 border border-slate-200 bg-white p-6";

  const fieldGrid = embedded
    ? "grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
    : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const fieldLabelClass = embedded
    ? "mb-0.5 block text-[12px] font-medium text-slate-700"
    : labelClass;
  const fieldInputClass = embedded
    ? "w-full border border-slate-300 bg-white px-2 py-1 text-[12px] text-slate-900 placeholder:text-slate-400 focus:border-maroon focus:outline-none"
    : inputClass;

  const readOnlyFields: (keyof CorporateFormData)[] = ["corpId", "policyNo"];

  const renderFields = (fields: CorporateField[]) => (
    <div className={fieldGrid}>
      {fields.map((field) => (
        <FormField
          key={field.name}
          id={field.name}
          name={field.name}
          label={field.label}
          as={
            field.name === "businessClass" ||
            field.name === "branch" ||
            field.name === "channel" ||
            field.name === "town" ||
            field.name === "currency" ||
            field.name === "agentId"
              ? "select"
              : "input"
          }
          type={field.type ?? "text"}
          required={field.required}
          value={form[field.name]}
          onChange={handleChange}
          disabled={readOnlyFields.includes(field.name)}
          inputClassName={
            readOnlyFields.includes(field.name)
              ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
              : fieldInputClass
          }
          selectClassName={`${fieldInputClass} h-[30px]`}
          labelClassName={fieldLabelClass}
          placeholder={
            readOnlyFields.includes(field.name)
              ? corporateId
                ? undefined
                : ""
              : field.placeholder
          }
          options={
            field.name === "businessClass"
              ? [{ value: "", label: "Select business class" }, ...businessClassOptions]
              : field.name === "branch"
                ? [{ value: "", label: "Select branch" }, ...branchOptions]
                : field.name === "channel"
                  ? [{ value: "", label: "Select channel" }, ...channelOptions]
                  : field.name === "town"
                    ? [{ value: "", label: "Select town" }, ...townOptions]
                    : field.name === "currency"
                      ? [{ value: "", label: "Select currency" }, ...currencyOptions]
                      : field.name === "agentId"
                        ? [{ value: "", label: "Select intermediary" }, ...agentOptions]
                        : undefined
          }
        />
      ))}
    </div>
  );

  const corporateDetailsSection = (
    <section className="space-y-1.5">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">Corporate Details</h3>
        <p className="text-[12px] text-slate-500">Capture corporate information.</p>
      </div>
      {renderFields(getCorporateFields(corporateFieldNames))}
    </section>
  );

  const activeTabPanel = (() => {
    switch (activeTab) {
      case "corporate":
        return (
          <div className="space-y-2">
            {corporateDetailsSection}
            <CoverDatesForm
              value={coverDateForm}
              corporateAgentId={form.agentId}
              agentOptions={agentOptions}
              onChange={handleCoverDateChange}
              fieldLabelClass={fieldLabelClass}
              fieldInputClass={fieldInputClass}
              withTopBorder
            />
          </div>
        );
      case "contact":
        return (
          <ContactPersonForm
            rows={contactPersonRows}
            onRowChange={handleContactPersonRowChange}
            onAddRow={handleAddContactPersonRow}
            onRemoveRow={handleRemoveContactPersonRow}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
          />
        );
      case "categories":
        return (
          <CategoriesForm
            rows={categoryGroupRows}
            benefitOptions={benefitOptions}
            categoryOptions={categoryOptions}
            coverDateAnniv={coverDateForm.anniv || "1"}
            onRowChange={handleCategoryGroupRowChange}
            onAddRow={handleAddCategoryGroupRow}
            onRemoveRow={handleRemoveCategoryGroupRow}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
          />
        );
      case "providerRestrictions":
        return (
          <ProviderRestrictionsForm
            rows={providerRestrictionRows}
            coverDateAnniv={coverDateForm.anniv || "1"}
            providerOptions={providerOptions}
            onRowChange={handleProviderRestrictionRowChange}
            onAddRow={handleAddProviderRestrictionRow}
            onRemoveRow={handleRemoveProviderRestrictionRow}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
          />
        );
      case "premiumRates":
        return (
          <PremiumRatesForm
            rows={premiumRateRows}
            benefitOptions={benefitOptions}
            businessClass={form.businessClass}
            onRowChange={handlePremiumRateRowChange}
            onAddRow={handleAddPremiumRateRow}
            onRemoveRow={handleRemovePremiumRateRow}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
          />
        );
    }
  })();

  const formBody = (
    <>
      <FormError message={error} />

      {embedded ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 md:flex-row">
          <div className="flex shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50 p-1 md:block md:w-32 md:overflow-visible md:border-b-0 md:border-r">
            {corporateTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`block shrink-0 px-2 py-1 text-left text-[12px] font-medium transition md:w-full ${
                  activeTab === tab.id
                    ? "bg-maroon/10 text-maroon"
                    : "text-slate-500 hover:bg-white hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2">
            {activeTabPanel}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {corporateDetailsSection}
          <CoverDatesForm
            value={coverDateForm}
            corporateAgentId={form.agentId}
            agentOptions={agentOptions}
            onChange={handleCoverDateChange}
            fieldLabelClass={fieldLabelClass}
            fieldInputClass={fieldInputClass}
            withTopBorder
          />
        </div>
      )}
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
        {loading ? "Saving..." : corporateId ? "Update Corporate" : "Create Corporate"}
      </Button>
      {onCancel ? (
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      ) : (
        <ButtonLink href="/admin/medical/corporates?manage=1" variant="secondary" size="sm">
          Cancel
        </ButtonLink>
      )}
    </div>
  );

  if (embedded) {
    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="flex min-h-0 flex-1 flex-col space-y-1.5 overflow-hidden">{formBody}</div>
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
