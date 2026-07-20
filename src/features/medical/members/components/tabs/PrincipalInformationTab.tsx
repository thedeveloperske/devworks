"use client";

import { FormField } from "@/components/admin/FormField";
import {
  getPrincipalInformationFields,
  principalInformationFieldNames,
  type FamilyDependantRow,
  type PrincipalInformationFormData,
} from "@/features/medical/members";
import {
  branchOptions,
  businessClassOptions,
  familySizeOptions,
  townOptions,
} from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";
import { FamilyDependantsTable } from "./FamilyDependantsTable";

type PrincipalInformationTabProps = {
  value: PrincipalInformationFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  agentOptions: LookupOption[];
  categoryOptions: LookupOption[];
  fieldLabelClass: string;
  fieldInputClass: string;
  corpIdDisabled?: boolean;
  corporateName?: string;
  dependants?: FamilyDependantRow[];
  onAddDependant?: () => void;
  onEditDependant?: (memberNo: string) => void;
};

const yesNoOptions: LookupOption[] = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

export function PrincipalInformationTab({
  value,
  onChange,
  agentOptions,
  categoryOptions,
  fieldLabelClass,
  fieldInputClass,
  corpIdDisabled = true,
  corporateName = "",
  dependants = [],
  onAddDependant,
  onEditDependant,
}: PrincipalInformationTabProps) {
  const selectFields: Partial<
    Record<
      keyof PrincipalInformationFormData,
      { options: LookupOption[]; placeholder: string }
    >
  > = {
    agentId: { options: agentOptions, placeholder: "Select intermediary" },
    town: { options: townOptions, placeholder: "Select town" },
    familySize: {
      options: familySizeOptions,
      placeholder: "Select family size",
    },
    businessClass: {
      options: businessClassOptions,
      placeholder: "Select business class",
    },
    witnessed: { options: yesNoOptions, placeholder: "Select" },
    formFilled: { options: yesNoOptions, placeholder: "Select" },
    shareData: { options: yesNoOptions, placeholder: "Select" },
    category: { options: categoryOptions, placeholder: "Select category" },
    branch: { options: branchOptions, placeholder: "Select branch" },
  };

  return (
    <div className="space-y-2">
      <section className="space-y-1.5">
        <div>
          <h3 className="text-[12px] font-bold uppercase text-slate-700">
            Principal Details
          </h3>
          <p className="text-[12px] text-slate-500">
            Capture principal information.
          </p>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {getPrincipalInformationFields(principalInformationFieldNames).map(
            (field) => {
              const selectConfig = selectFields[field.name];
              const isCorpId = field.name === "corpId";
              const isPolicyNo = field.name === "policyNo";
              const isBusinessClass = field.name === "businessClass";
              const isBranch = field.name === "branch";
              const isAgentId = field.name === "agentId";
              const isFamilySize = field.name === "familySize";
              const isFamilyNo = field.name === "familyNo";
              const isMemberNo = field.name === "memberNo";
              const locked =
                isFamilySize ||
                isFamilyNo ||
                isMemberNo ||
                ((isCorpId ||
                  isPolicyNo ||
                  isBusinessClass ||
                  isBranch ||
                  isAgentId) &&
                  corpIdDisabled);
              const as = selectConfig ? "select" : "input";

              return (
                <FormField
                  key={field.name}
                  id={`principal-${field.name}`}
                  name={field.name}
                  label={field.label}
                  as={as}
                  type={field.type ?? "text"}
                  required={field.required}
                value={
                  isCorpId && corporateName
                    ? corporateName
                    : value[field.name]
                }
                placeholder={
                  (isFamilyNo || isMemberNo) && !value[field.name]
                    ? "Assigned on create"
                    : undefined
                }
                  onChange={
                    locked
                      ? () => undefined
                      : (e) =>
                          // This tab renders only inputs/selects, never textareas.
                          onChange(
                            e as React.ChangeEvent<
                              HTMLInputElement | HTMLSelectElement
                            >
                          )
                  }
                  disabled={locked}
                  inputClassName={
                    locked
                      ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
                      : fieldInputClass
                  }
                  selectClassName={`${fieldInputClass} h-[30px]${
                    locked ? " cursor-not-allowed bg-slate-50 text-slate-600" : ""
                  }`}
                  labelClassName={fieldLabelClass}
                  options={
                    selectConfig
                      ? [
                          { value: "", label: selectConfig.placeholder },
                          ...selectConfig.options,
                        ]
                      : undefined
                  }
                />
              );
            }
          )}
        </div>
      </section>
      <FamilyDependantsTable
        rows={dependants}
        withTopBorder
        onAddDependant={onAddDependant}
        onEditDependant={onEditDependant}
      />
    </div>
  );
}
