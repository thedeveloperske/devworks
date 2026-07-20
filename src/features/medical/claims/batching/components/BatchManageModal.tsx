"use client";

import { useEffect, useState } from "react";
import type { LookupOption } from "@/features/medical/lookups/types";
import type { ClaimsBatchFormData, ClaimsBatchListItem } from "@/features/medical/claims/batching";
import type { BatchManageTab } from "@/features/medical/claims/batching/batch-manage-types";
import { canAssignAuthorizer, canAssignVetter } from "@/features/medical/claims/batching/batch-workflow";
import { AssignAuthorizerForm } from "./AssignAuthorizerForm";
import { AssignEntrantForm } from "./AssignEntrantForm";
import { AssignVetterForm } from "./AssignVetterForm";
import { ClaimsBatchForm } from "./ClaimsBatchForm";

type BatchManageModalProps = {
  batchId: string;
  tab: BatchManageTab;
  batch: ClaimsBatchListItem;
  providers: LookupOption[];
  currentUserName: string;
  onTabChange: (tab: BatchManageTab) => void;
  onClose: () => void;
  onUpdated: (message: string) => void;
};

const tabButtonClass =
  "border-b-2 px-3 py-1.5 text-[12px] font-semibold transition-colors";
const tabActiveClass = "border-maroon text-maroon";
const tabInactiveClass = "border-transparent text-slate-500 hover:text-slate-700";
const tabDisabledClass =
  "cursor-not-allowed border-transparent text-slate-300 hover:text-slate-300";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function BatchManageModal({
  batchId,
  tab,
  batch,
  providers,
  currentUserName,
  onTabChange,
  onClose,
  onUpdated,
}: BatchManageModalProps) {
  const [loading, setLoading] = useState(tab === "edit");
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState<ClaimsBatchFormData | null>(null);

  const entrantAssigned = canAssignVetter(batch);
  const vetterAssigned = canAssignAuthorizer(batch);

  useEffect(() => {
    if (tab !== "edit") return;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/medical/claims/batches/${batchId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load batch");
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setEditForm(data.form);
        setLoading(false);
      })
      .catch((fetchError: unknown) => {
        if (cancelled) return;
        setEditForm(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load batch"
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, tab]);

  const tabs: Array<{
    id: BatchManageTab;
    label: string;
    disabled?: boolean;
    title?: string;
  }> = [
    { id: "edit", label: "Edit batch" },
    { id: "entrant", label: batch.dataEntryUser ? "Reassign entrant" : "Assign entrant" },
    {
      id: "vetter",
      label: batch.vettingUser ? "Reassign vetter" : "Assign vetter",
      disabled: !entrantAssigned,
      title: entrantAssigned ? undefined : "Assign an entrant before assigning a vetter",
    },
    {
      id: "authorizer",
      label: batch.authorisingUser ? "Reassign authorizer" : "Assign authorizer",
      disabled: !vetterAssigned,
      title: vetterAssigned ? undefined : "Assign a vetter before assigning an authorizer",
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            title={item.title}
            onClick={() => onTabChange(item.id)}
            className={`${tabButtonClass} ${
              item.disabled
                ? tabDisabledClass
                : tab === item.id
                  ? tabActiveClass
                  : tabInactiveClass
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 pt-3">
        {tab === "edit" ? (
          loading ? (
            <p className="text-[12px] text-slate-500">Loading batch...</p>
          ) : error ? (
            <p className="text-[12px] text-red-600">{error}</p>
          ) : editForm ? (
            <ClaimsBatchForm
              key={batchId}
              embedded
              batchId={batchId}
              initial={editForm}
              providers={providers}
              currentUserName={currentUserName}
              onSuccess={() => {
                onUpdated("Batch updated.");
                onClose();
              }}
              onCancel={onClose}
            />
          ) : null
        ) : tab === "entrant" ? (
          <AssignEntrantForm
            key={`${batchId}-entrant-${batch.dataEntryUser ?? ""}-${batch.dateEntryDate ?? ""}`}
            embedded
            batchId={batchId}
            batchNo={batch.batchNo ?? `#${batchId}`}
            initial={{
              entrantUser: batch.dataEntryUser ?? "",
              assignedDate: batch.dateEntryDate ?? todayIsoDate(),
            }}
            onSuccess={() => onUpdated("Batch assigned to entrant.")}
            onCancel={onClose}
          />
        ) : tab === "vetter" ? (
          entrantAssigned ? (
            <AssignVetterForm
              key={`${batchId}-vetter-${batch.vettingUser ?? ""}-${batch.vettingUserDate ?? ""}`}
              embedded
              batchId={batchId}
              batchNo={batch.batchNo ?? `#${batchId}`}
              entrantName={batch.dataEntryUser ?? ""}
              initial={{
                vetterUser: batch.vettingUser ?? "",
                assignedDate: batch.vettingUserDate ?? todayIsoDate(),
              }}
              onSuccess={() => onUpdated("Batch assigned to vetter.")}
              onCancel={onClose}
            />
          ) : (
            <p className="text-[12px] text-red-600">
              This batch must be assigned to an entrant before a vetter can be assigned.
            </p>
          )
        ) : vetterAssigned ? (
          <AssignAuthorizerForm
            key={`${batchId}-authorizer-${batch.authorisingUser ?? ""}-${batch.authorisingUserDate ?? ""}`}
            embedded
            batchId={batchId}
            batchNo={batch.batchNo ?? `#${batchId}`}
            vetterName={batch.vettingUser ?? ""}
            initial={{
              authorizerUser: batch.authorisingUser ?? "",
              assignedDate: batch.authorisingUserDate ?? todayIsoDate(),
            }}
            onSuccess={() => onUpdated("Batch assigned to authorizer.")}
            onCancel={onClose}
          />
        ) : (
          <p className="text-[12px] text-red-600">
            This batch must be assigned to a vetter before an authorizer can be assigned.
          </p>
        )}
      </div>
    </div>
  );
}
