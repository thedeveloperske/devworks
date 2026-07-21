"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormField } from "@/components/admin/FormField";
import { Switch } from "@/components/admin/Switch";
import {
  bioDataFieldNames,
  getBioDataFields,
  type BioDataFormData,
} from "@/features/medical/members";
import {
  bloodGroupOptions,
  familyRelationshipOptions,
  occupationOptions,
} from "@/features/medical/lookups";
import type { LookupOption } from "@/features/medical/lookups/types";

/** Card dates captured in the Photo Availed modal instead of inline fields. */
const cardDateFields = [
  { name: "infoToPrinter", label: "Date to Printer" },
  { name: "cardFromPrinter", label: "Date from Printer" },
  { name: "cardToMember", label: "Date to Member" },
] as const;

type CardDateName = (typeof cardDateFields)[number]["name"];

type BioDataTabProps = {
  value: BioDataFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  fieldLabelClass: string;
  fieldInputClass: string;
  memberNoDisabled?: boolean;
  /**
   * When true (principal create/edit), Family Title and Relationship stay locked
   * to Principal. When false (dependant), Family Title stays locked to Dependant
   * and Relationship to Principal is editable.
   */
  lockPrincipalRelationship?: boolean;
  corporateName?: string;
};

const yesNoOptions: LookupOption[] = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
];

const genderOptions: LookupOption[] = [
  { value: "1", label: "Male" },
  { value: "2", label: "Female" },
];

export function BioDataTab({
  value,
  onChange,
  fieldLabelClass,
  fieldInputClass,
  memberNoDisabled = true,
  lockPrincipalRelationship = true,
  corporateName = "",
}: BioDataTabProps) {
  const [cardModalOpen, setCardModalOpen] = useState(false);
  /** True when the modal was opened by switching Photo Availed on. */
  const [cardModalIsFreshToggle, setCardModalIsFreshToggle] = useState(false);
  const [cardDraft, setCardDraft] = useState<Record<CardDateName, string>>({
    infoToPrinter: "",
    cardFromPrinter: "",
    cardToMember: "",
  });

  const photoAvailed = value.photoNForm === "1";

  const emitChange = (name: string, newValue: string) => {
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const openCardModal = (freshToggle: boolean) => {
    setCardDraft({
      infoToPrinter: value.infoToPrinter,
      cardFromPrinter: value.cardFromPrinter,
      cardToMember: value.cardToMember,
    });
    setCardModalIsFreshToggle(freshToggle);
    setCardModalOpen(true);
  };

  const handlePhotoSwitch = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(e);
    if (e.target.value === "1") {
      openCardModal(true);
    } else {
      // Switching off clears the card dates.
      cardDateFields.forEach((field) => emitChange(field.name, ""));
    }
  };

  const cancelCardModal = () => {
    if (cardModalIsFreshToggle) {
      emitChange("photoNForm", "0");
    }
    setCardModalOpen(false);
  };

  const saveCardModal = () => {
    cardDateFields.forEach((field) => emitChange(field.name, cardDraft[field.name]));
    setCardModalOpen(false);
  };

  const selectFields: Partial<
    Record<
      keyof BioDataFormData,
      { options: LookupOption[]; placeholder: string }
    >
  > = {
    familyTitle: {
      options: familyRelationshipOptions,
      placeholder: "Select family title",
    },
    relationToPrincipal: {
      // Dependants choose Spouse/Son/Daughter/etc.; Principal is not a valid option.
      options: lockPrincipalRelationship
        ? familyRelationshipOptions
        : familyRelationshipOptions.filter((option) => option.value !== "1"),
      placeholder: "Select relationship",
    },
    occupation: {
      options: occupationOptions,
      placeholder: "Select occupation",
    },
    gender: { options: genderOptions, placeholder: "Select gender" },
    bloodGroup: {
      options: bloodGroupOptions,
      placeholder: "Select blood group",
    },
    cancelled: { options: yesNoOptions, placeholder: "Select" },
  };

  const cardDateSummary = cardDateFields
    .filter((field) => value[field.name])
    .map((field) => `${field.label}: ${value[field.name]}`)
    .join(" · ");

  return (
    <section className="space-y-1.5">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">
          Bio Data
        </h3>
        <p className="text-[12px] text-slate-500">
          Capture bio data information.
        </p>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {getBioDataFields(bioDataFieldNames).map((field) => {
          if (
            field.name === "infoToPrinter" ||
            field.name === "cardFromPrinter" ||
            field.name === "cardToMember"
          ) {
            return null;
          }

          if (field.name === "photoNForm") {
            return (
              <div key={field.name} className="min-w-0">
                <Switch
                  id="bio-photoNForm"
                  name="photoNForm"
                  label={field.label}
                  checked={photoAvailed}
                  onChange={handlePhotoSwitch}
                  labelClassName={fieldLabelClass}
                />
                {photoAvailed ? (
                  <div className="mt-1 flex min-w-0 items-center gap-2 text-[12px] text-slate-600">
                    <span className="min-w-0 truncate">
                      {cardDateSummary || (
                        <span className="text-slate-400">
                          No card dates captured
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => openCardModal(false)}
                      className="shrink-0 font-semibold text-maroon hover:underline"
                    >
                      {cardDateSummary ? "Edit" : "Add"}
                    </button>
                  </div>
                ) : null}
              </div>
            );
          }

          const selectConfig = selectFields[field.name];
          const isMemberNo = field.name === "memberNo";
          const isCorpId = field.name === "corpId";
          const isFamilyNo = field.name === "familyNo";
          const isRelationToPrincipal = field.name === "relationToPrincipal";
          const isFamilyTitle = field.name === "familyTitle";
          const disabled =
            // Family Title is always system-managed (Principal or Dependant).
            isFamilyTitle ||
            // Relationship is locked for principals; editable for dependants.
            (lockPrincipalRelationship && isRelationToPrincipal) ||
            isFamilyNo ||
            (isMemberNo && memberNoDisabled) ||
            (isCorpId && memberNoDisabled);
          const as = selectConfig ? "select" : "input";

          return (
            <FormField
              key={field.name}
              id={`bio-${field.name}`}
              name={field.name}
              label={field.label}
              as={as}
              type={field.type ?? "text"}
              required={field.required}
              value={
                isCorpId && corporateName ? corporateName : value[field.name]
              }
              placeholder={
                (isFamilyNo || isMemberNo) && !value[field.name]
                  ? "Assigned on create"
                  : undefined
              }
              onChange={
                disabled
                  ? () => undefined
                  : (e) => onChange(e)
              }
              disabled={disabled}
              inputClassName={
                disabled
                  ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
                  : fieldInputClass
              }
              selectClassName={
                disabled
                  ? `${fieldInputClass} h-[30px] cursor-not-allowed bg-slate-50 text-slate-600`
                  : `${fieldInputClass} h-[30px]`
              }
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
        })}
      </div>

      {cardModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close card information dialog"
            className="absolute inset-0 bg-slate-900/40"
            onClick={cancelCardModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bio-card-modal-title"
            className="relative w-full max-w-sm border border-slate-200 bg-white p-4 shadow-lg"
          >
            <h3
              id="bio-card-modal-title"
              className="text-[12px] font-bold uppercase text-slate-900"
            >
              Card Information
            </h3>
            <div className="mt-3 space-y-3">
              {cardDateFields.map((field) => (
                <FormField
                  key={field.name}
                  id={`bio-card-modal-${field.name}`}
                  name={field.name}
                  label={field.label}
                  as="input"
                  type="date"
                  value={cardDraft[field.name]}
                  onChange={(e) =>
                    setCardDraft((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  inputClassName={fieldInputClass}
                  labelClassName={fieldLabelClass}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={cancelCardModal}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={saveCardModal}>
                Add
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
