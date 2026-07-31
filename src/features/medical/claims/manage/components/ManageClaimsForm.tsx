"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/admin/Button";
import { defaultClaimDetailsForm } from "@/features/medical/claims/manage/claim-details-constants";
import {
  defaultManageClaimsTab,
  manageClaimsTabs,
  type ManageClaimsTabId,
} from "@/features/medical/claims/manage/constants";
import type { ClaimDetailsFormData } from "@/features/medical/claims/manage/types";
import type { LookupOption } from "@/features/medical/lookups/types";
import { ClaimDetailsTab } from "./tabs/ClaimDetailsTab";
import { ManageClaimsTabSkeleton } from "./tabs/ManageClaimsTabSkeleton";

type ManageClaimsFormProps = {
  embedded?: boolean;
  claimId?: string;
  initialDetails?: Partial<ClaimDetailsFormData>;
  providerOptions?: LookupOption[];
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function ManageClaimsForm({
  embedded = false,
  claimId,
  initialDetails,
  providerOptions = [],
  onCancel,
  onSuccess: _onSuccess,
}: ManageClaimsFormProps) {
  const [activeTab, setActiveTab] = useState<ManageClaimsTabId>(
    defaultManageClaimsTab
  );
  const [details, setDetails] = useState<ClaimDetailsFormData>({
    ...defaultClaimDetailsForm,
    ...initialDetails,
  });

  const handleDetailsChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Save wiring comes once remaining tabs and API are ready.
  };

  const activeTabPanel = (() => {
    switch (activeTab) {
      case "claimDetails":
        return (
          <ClaimDetailsTab
            value={details}
            onChange={handleDetailsChange}
            providerOptions={providerOptions}
          />
        );
      case "claimForm":
        return <ManageClaimsTabSkeleton title="Claim Form" />;
      case "clinicalDiagnosis":
        return <ManageClaimsTabSkeleton title="Clinical Diagnosis" />;
      case "claimStatus":
        return <ManageClaimsTabSkeleton title="Claim Status" />;
    }
  })();

  const formBody = embedded ? (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 md:flex-row">
      <div className="flex shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50 p-1 md:block md:w-36 md:overflow-visible md:border-b-0 md:border-r">
        {manageClaimsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`block shrink-0 px-2 py-1 text-left text-[11px] font-medium transition md:w-full ${
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
    activeTabPanel
  );

  const formActions = (
    <div
      className={`flex gap-3 ${
        embedded
          ? "shrink-0 justify-center border-t border-slate-200 bg-white pt-1.5"
          : "border-t border-slate-200 pt-4"
      }`}
    >
      <Button type="submit" size="sm" disabled>
        {claimId ? "Update Claim" : "Create Claim"}
      </Button>
      {onCancel ? (
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );

  if (embedded) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col space-y-1.5 overflow-hidden">
          {formBody}
        </div>
        {formActions}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formBody}
      {formActions}
    </form>
  );
}
