"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/admin/Button";
import { defaultClaimDetailsForm } from "@/features/medical/claims/manage/claim-details-constants";
import { defaultClaimFormTab } from "@/features/medical/claims/manage/claim-form-constants";
import { defaultClaimLineItem } from "@/features/medical/claims/manage/claim-line-item-constants";
import {
  defaultManageClaimsTab,
  visibleManageClaimsTabs,
  type ManageClaimsTabId,
} from "@/features/medical/claims/manage/constants";
import type {
  ClaimDetailsFormData,
  ClaimFormTabData,
  ClaimLineItemFormData,
  ManageClaimsBatchOption,
  ManageClaimsMemberAnniversary,
  ManageClaimsMemberBenefitOption,
} from "@/features/medical/claims/manage/types";
import { resolveAnnivForInvoiceDate, getInvoiceDateBounds } from "@/features/medical/claims/manage/resolve-anniv";
import type { LookupOption } from "@/features/medical/lookups/types";
import { ClaimDetailsTab } from "./tabs/ClaimDetailsTab";
import { ClaimFormTab } from "./tabs/ClaimFormTab";
import { MemberClaimHistoryTab } from "./tabs/MemberClaimHistoryTab";

type ManageClaimsFormProps = {
  embedded?: boolean;
  claimId?: string;
  initialDetails?: Partial<ClaimDetailsFormData>;
  initialClaimForm?: Partial<ClaimFormTabData>;
  initialLineItems?: ClaimLineItemFormData[];
  memberAnniversaries?: ManageClaimsMemberAnniversary[];
  memberBenefits?: ManageClaimsMemberBenefitOption[];
  entrantBatches?: ManageClaimsBatchOption[];
  providerOptions?: LookupOption[];
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function ManageClaimsForm({
  embedded = false,
  claimId,
  initialDetails,
  initialClaimForm,
  initialLineItems,
  memberAnniversaries = [],
  memberBenefits = [],
  entrantBatches = [],
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
  const [claimForm, setClaimForm] = useState<ClaimFormTabData>({
    ...defaultClaimFormTab,
    ...initialClaimForm,
  });
  const [lineItems, setLineItems] = useState<ClaimLineItemFormData[]>(
    initialLineItems ?? [defaultClaimLineItem()]
  );

  const claimNatureOptions = useMemo(() => {
    const anniv = details.anniv.trim();
    if (!anniv) return [];
    return memberBenefits
      .filter((benefit) => benefit.anniv === anniv)
      .map((benefit) => ({
        value: benefit.benefit,
        label: benefit.label,
      }));
  }, [details.anniv, memberBenefits]);

  const batchNoOptions = useMemo(() => {
    const provider = details.provider.trim();
    if (!provider) return [];
    return entrantBatches
      .filter((batch) => batch.providerCode === provider)
      .map((batch) => ({
        value: batch.batchNo,
        label: batch.batchNo,
      }));
  }, [details.provider, entrantBatches]);

  const invoiceDateBounds = useMemo(
    () => getInvoiceDateBounds(memberAnniversaries),
    [memberAnniversaries]
  );

  useEffect(() => {
    const claimNo = details.claimNo.trim();
    if (!claimNo) return;
    setClaimForm((prev) =>
      prev.claimNo === claimNo ? prev : { ...prev, claimNo }
    );
  }, [details.claimNo]);

  useEffect(() => {
    const nextAnniv = resolveAnnivForInvoiceDate(
      memberAnniversaries,
      details.invoiceDate
    );
    setDetails((prev) => {
      if (prev.anniv === nextAnniv) return prev;
      const annivBenefits = memberBenefits.filter(
        (benefit) => benefit.anniv === nextAnniv
      );
      const claimNatureStillValid = annivBenefits.some(
        (benefit) => benefit.benefit === prev.claimNature
      );
      return {
        ...prev,
        anniv: nextAnniv,
        claimNature: claimNatureStillValid ? prev.claimNature : "",
      };
    });
  }, [details.invoiceDate, memberAnniversaries, memberBenefits]);

  const handleDetailsChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDetails((prev) => {
      if (name === "provider") {
        const stillValid = entrantBatches.some(
          (batch) =>
            batch.providerCode === value && batch.batchNo === prev.batchNo
        );
        return {
          ...prev,
          provider: value,
          batchNo: stillValid ? prev.batchNo : "",
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleClaimFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setClaimForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLineItemChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLineItems((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [name]: value } : row
      )
    );
  };

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, defaultClaimLineItem()]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
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
            claimNatureOptions={claimNatureOptions}
            batchNoOptions={batchNoOptions}
            invoiceDateMin={invoiceDateBounds.min}
            invoiceDateMax={invoiceDateBounds.max}
          />
        );
      case "claimForm":
        return (
          <ClaimFormTab
            value={claimForm}
            onChange={handleClaimFormChange}
            lineItems={lineItems}
            onLineItemChange={handleLineItemChange}
            onAddLineItem={handleAddLineItem}
            onRemoveLineItem={handleRemoveLineItem}
          />
        );
      case "memberClaimHistory":
        return <MemberClaimHistoryTab />;
      default:
        return null;
    }
  })();

  const formBody = embedded ? (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 md:flex-row">
      <div className="flex shrink-0 overflow-x-auto border-b border-slate-200 bg-slate-50 p-1 md:block md:w-44 md:overflow-visible md:border-b-0 md:border-r">
        {visibleManageClaimsTabs.map((tab) => (
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
