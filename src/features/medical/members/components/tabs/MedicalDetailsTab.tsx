"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormField } from "@/components/admin/FormField";
import { Switch } from "@/components/admin/Switch";
import {
  getMedicalDetailsFields,
  medicalDetailsFieldNames,
  type MedicalDetailsFormData,
} from "@/features/medical/members";

type MedicalDetailsTabProps = {
  value: MedicalDetailsFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  fieldLabelClass: string;
  fieldInputClass: string;
  memberNoDisabled?: boolean;
};

const fieldsByName = new Map(
  getMedicalDetailsFields(medicalDetailsFieldNames).map((field) => [
    field.name,
    field,
  ])
);

function fieldMeta(name: keyof MedicalDetailsFormData) {
  return fieldsByName.get(name)!;
}

/** Switches whose details are captured in a popup instead of an inline field. */
const detailFieldBySwitch = {
  currentlyIll: "currentIllDetails",
  recentConsultedDoc: "recentConsultedDetails",
  onRegularMedication: "regularMedicationDetails",
  disabled: "disabilityDetails",
  expectant: "expectedDeliveryDate",
} as const;

type DetailSwitchName = keyof typeof detailFieldBySwitch;

export function MedicalDetailsTab({
  value,
  onChange,
  fieldLabelClass,
  fieldInputClass,
  memberNoDisabled = true,
}: MedicalDetailsTabProps) {
  const [detailModalSwitch, setDetailModalSwitch] =
    useState<DetailSwitchName | null>(null);
  const [detailDraft, setDetailDraft] = useState("");

  const emitChange = (name: string, newValue: string) => {
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const openDetailModal = (switchName: DetailSwitchName) => {
    setDetailDraft(value[detailFieldBySwitch[switchName]]);
    setDetailModalSwitch(switchName);
  };

  const closeDetailModal = () => {
    setDetailModalSwitch(null);
    setDetailDraft("");
  };

  const cancelDetailModal = () => {
    if (!detailModalSwitch) return;
    // Cancelling the initial capture turns the switch back off (the parent
    // clears the detail field). Cancelling an edit keeps the saved detail.
    if (!value[detailFieldBySwitch[detailModalSwitch]].trim()) {
      emitChange(detailModalSwitch, "0");
    }
    closeDetailModal();
  };

  const saveDetailModal = () => {
    if (!detailModalSwitch) return;
    emitChange(detailFieldBySwitch[detailModalSwitch], detailDraft.trim());
    closeDetailModal();
  };

  const renderSwitch = (name: keyof MedicalDetailsFormData) => {
    const field = fieldMeta(name);
    return (
      <Switch
        key={name}
        id={`medical-${name}`}
        name={name}
        label={field.label}
        checked={value[name] === "1"}
        onChange={onChange}
        labelClassName={fieldLabelClass}
      />
    );
  };

  const renderDetailSwitch = (switchName: DetailSwitchName) => {
    const field = fieldMeta(switchName);
    const detailName = detailFieldBySwitch[switchName];
    const on = value[switchName] === "1";
    const detail = value[detailName];

    return (
      <div key={switchName} className="min-w-0">
        <Switch
          id={`medical-${switchName}`}
          name={switchName}
          label={field.label}
          checked={on}
          onChange={(e) => {
            onChange(e);
            if (e.target.value === "1") {
              setDetailDraft("");
              setDetailModalSwitch(switchName);
            }
          }}
          labelClassName={fieldLabelClass}
        />
        {on ? (
          <div className="mt-1 flex min-w-0 items-center gap-2 text-[12px] text-slate-600">
            <span className="min-w-0 truncate">
              {detail || (
                <span className="text-slate-400">No details captured</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => openDetailModal(switchName)}
              className="shrink-0 font-semibold text-maroon hover:underline"
            >
              {detail ? "Edit" : "Add"}
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderInput = (
    name: keyof MedicalDetailsFormData,
    options?: { disabled?: boolean }
  ) => {
    const field = fieldMeta(name);
    const isMemberNo = name === "memberNo";
    const isAnniv = name === "anniv";
    const disabled =
      options?.disabled ?? (isAnniv || (isMemberNo && memberNoDisabled));

    return (
      <FormField
        key={name}
        id={`medical-${name}`}
        name={name}
        label={field.label}
        as="input"
        type={field.type ?? "text"}
        required={field.required}
        value={value[name]}
        placeholder={
          isMemberNo && !value.memberNo ? "Assigned on create" : undefined
        }
        onChange={disabled ? () => undefined : onChange}
        disabled={disabled}
        inputClassName={
          disabled
            ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
            : fieldInputClass
        }
        labelClassName={fieldLabelClass}
      />
    );
  };

  const modalSwitchField = detailModalSwitch
    ? fieldMeta(detailModalSwitch)
    : null;
  const modalDetailField = detailModalSwitch
    ? fieldMeta(detailFieldBySwitch[detailModalSwitch])
    : null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">
          Medical Details
        </h3>
        <p className="text-[12px] text-slate-500">
          Capture medical details information.
        </p>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {renderInput("memberNo")}
        {renderInput("anniv")}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {renderSwitch("asthma")}
        {renderSwitch("diabetes")}
        {renderSwitch("cancer")}
      </div>

      <div className="grid grid-cols-3 gap-x-1.5 gap-y-3">
        {renderDetailSwitch("currentlyIll")}
        {renderDetailSwitch("recentConsultedDoc")}
        {renderDetailSwitch("onRegularMedication")}
        {renderDetailSwitch("disabled")}
        {renderDetailSwitch("expectant")}
      </div>

      {detailModalSwitch && modalSwitchField && modalDetailField ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close details dialog"
            className="absolute inset-0 bg-slate-900/40"
            onClick={cancelDetailModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="medical-detail-modal-title"
            className="relative w-full max-w-sm border border-slate-200 bg-white p-4 shadow-lg"
          >
            <h3
              id="medical-detail-modal-title"
              className="text-[12px] font-bold uppercase text-slate-900"
            >
              {modalSwitchField.label}
            </h3>
            <div className="mt-3">
              <FormField
                id="medical-detail-modal-input"
                name={modalDetailField.name}
                label={modalDetailField.label}
                as="input"
                type={modalDetailField.type ?? "text"}
                value={detailDraft}
                onChange={(e) => setDetailDraft(e.target.value)}
                inputClassName={fieldInputClass}
                labelClassName={fieldLabelClass}
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={cancelDetailModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveDetailModal}
                disabled={!detailDraft.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
