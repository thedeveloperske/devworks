"use client";

import { useState } from "react";
import { Button } from "@/components/admin/Button";
import { FormField } from "@/components/admin/FormField";
import { RadioGroup } from "@/components/admin/RadioGroup";
import type { MemberAcceptanceFormData } from "@/features/medical/members";
import { defRejOptions } from "@/features/medical/lookups";

type AcceptanceTabProps = {
  value: MemberAcceptanceFormData;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  fieldLabelClass: string;
  fieldInputClass: string;
  memberNoDisabled?: boolean;
};

/** Rejected / Deferred capture a Def/Rej reason and comments. */
const STATUS_ACCEPTED = "1";
const STATUS_REJECTED = "2";
const STATUS_DEFERRED = "3";

const statusOptions = [
  { value: STATUS_ACCEPTED, label: "Accepted" },
  { value: STATUS_REJECTED, label: "Rejected" },
  { value: STATUS_DEFERRED, label: "Deferred" },
];

function statusLabel(status: string) {
  return statusOptions.find((option) => option.value === status)?.label ?? "";
}

function isDefRejStatus(status: string) {
  return status === STATUS_REJECTED || status === STATUS_DEFERRED;
}

type ModalState = {
  /** Status the modal is capturing details for. */
  status: string;
  /** Status to restore if the user cancels a fresh selection (null when editing). */
  revertTo: string | null;
};

export function AcceptanceTab({
  value,
  onChange,
  fieldLabelClass,
  fieldInputClass,
  memberNoDisabled = true,
}: AcceptanceTabProps) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [draftStatusDate, setDraftStatusDate] = useState("");
  const [draftDefRej, setDraftDefRej] = useState("");
  const [draftComments, setDraftComments] = useState("");

  const emitChange = (name: string, newValue: string) => {
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const openModal = (status: string, revertTo: string | null) => {
    setDraftStatusDate(value.statusDate);
    setDraftDefRej(isDefRejStatus(status) ? value.defRej : "");
    setDraftComments(isDefRejStatus(status) ? value.comments : "");
    setModal({ status, revertTo });
  };

  const handleStatusChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const previous = value.status;
    onChange(e);
    if (e.target.value && e.target.value !== previous) {
      openModal(e.target.value, previous);
    }
  };

  const cancelModal = () => {
    if (!modal) return;
    if (modal.revertTo !== null) {
      emitChange("status", modal.revertTo);
    }
    setModal(null);
  };

  const saveModal = () => {
    if (!modal) return;
    emitChange("statusDate", draftStatusDate);
    if (isDefRejStatus(modal.status)) {
      emitChange("defRej", draftDefRej);
      emitChange("comments", draftComments.trim());
    } else {
      emitChange("defRej", "");
      emitChange("comments", "");
    }
    setModal(null);
  };

  const modalNeedsDefRej = modal ? isDefRejStatus(modal.status) : false;
  const canSaveModal =
    Boolean(draftStatusDate) && (!modalNeedsDefRej || Boolean(draftDefRej));

  const defRejLabel =
    defRejOptions.find((option) => option.value === value.defRej)?.label ??
    value.defRej;

  return (
    <section className="space-y-1.5">
      <div>
        <h3 className="text-[12px] font-bold uppercase text-slate-700">
          Acceptance
        </h3>
        <p className="text-[12px] text-slate-500">
          Approve, Reject or Defer Member.
        </p>
      </div>
      <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          id="acceptance-memberNo"
          name="memberNo"
          label="Member No"
          as="input"
          type="text"
          value={value.memberNo}
          placeholder={!value.memberNo ? "Assigned on create" : undefined}
          onChange={memberNoDisabled ? () => undefined : onChange}
          disabled={memberNoDisabled}
          inputClassName={
            memberNoDisabled
              ? `${fieldInputClass} cursor-not-allowed bg-slate-50 text-slate-600`
              : fieldInputClass
          }
          labelClassName={fieldLabelClass}
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <RadioGroup
            name="status"
            label="Status *"
            value={value.status}
            options={statusOptions}
            onChange={handleStatusChange}
            labelClassName={fieldLabelClass}
          />
        </div>
        {value.status ? (
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-600 sm:col-span-2 lg:col-span-3">
            <span>
              Status Date:{" "}
              {value.statusDate || (
                <span className="text-slate-400">not set</span>
              )}
            </span>
            {isDefRejStatus(value.status) ? (
              <>
                <span className="min-w-0 truncate">
                  Reason:{" "}
                  {defRejLabel || (
                    <span className="text-slate-400">not set</span>
                  )}
                </span>
                <span className="min-w-0 truncate">
                  Comments:{" "}
                  {value.comments || (
                    <span className="text-slate-400">none</span>
                  )}
                </span>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => openModal(value.status, null)}
              className="shrink-0 font-semibold text-maroon hover:underline"
            >
              Edit
            </button>
          </div>
        ) : null}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close status dialog"
            className="absolute inset-0 bg-slate-900/40"
            onClick={cancelModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="acceptance-status-modal-title"
            className="relative w-full max-w-sm border border-slate-200 bg-white p-4 shadow-lg"
          >
            <h3
              id="acceptance-status-modal-title"
              className="text-[12px] font-bold uppercase text-slate-900"
            >
              {statusLabel(modal.status)}
            </h3>
            <div className="mt-3 space-y-3">
              {modalNeedsDefRej ? (
                <>
                  <FormField
                    id="acceptance-modal-defRej"
                    name="defRej"
                    label="Reason"
                    as="select"
                    value={draftDefRej}
                    onChange={(e) => setDraftDefRej(e.target.value)}
                    selectClassName={`${fieldInputClass} h-[30px]`}
                    labelClassName={fieldLabelClass}
                    options={[
                      { value: "", label: "Select reason" },
                      ...defRejOptions,
                    ]}
                  />
                  <FormField
                    id="acceptance-modal-comments"
                    name="comments"
                    label="Comments"
                    as="input"
                    type="text"
                    value={draftComments}
                    onChange={(e) => setDraftComments(e.target.value)}
                    inputClassName={fieldInputClass}
                    labelClassName={fieldLabelClass}
                  />
                </>
              ) : null}
              <FormField
                id="acceptance-modal-statusDate"
                name="statusDate"
                label="Status Date"
                as="input"
                type="date"
                value={draftStatusDate}
                onChange={(e) => setDraftStatusDate(e.target.value)}
                inputClassName={fieldInputClass}
                labelClassName={fieldLabelClass}
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={cancelModal}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={saveModal}
                disabled={!canSaveModal}
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
