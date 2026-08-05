"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Button } from "@/components/admin/Button";
import { defaultClaimDetailsForm } from "@/features/medical/claims/manage/claim-details-constants";
import { defaultClaimDiagnosis } from "@/features/medical/claims/manage/claim-diagnosis-constants";
import { defaultClaimFormTab } from "@/features/medical/claims/manage/claim-form-constants";
import { defaultClaimLineItem } from "@/features/medical/claims/manage/claim-line-item-constants";
import {
  defaultManageClaimsTab,
  visibleManageClaimsTabs,
  type ManageClaimsTabId,
} from "@/features/medical/claims/manage/constants";
import type {
  ClaimDetailsFormData,
  ClaimDiagnosisFormData,
  ClaimFormTabData,
  ClaimLineItemFormData,
  ManageClaimsBatchOption,
  ManageClaimsMemberAnniversary,
  ManageClaimsMemberBenefitOption,
  ManageClaimsPreAuthOption,
} from "@/features/medical/claims/manage/types";
import {
  getInvoiceDateBounds,
  resolveAnnivForInvoiceDate,
} from "@/features/medical/claims/manage/resolve-anniv";
import type { LookupOption } from "@/features/medical/lookups/types";
import { AttachPreAuthModal } from "./AttachPreAuthModal";
import { ViewPreAuthModal } from "./ViewPreAuthModal";
import { ClaimDetailsTab } from "./tabs/ClaimDetailsTab";
import { ClaimFormTab } from "./tabs/ClaimFormTab";
import { ClinicalDiagnosisTab } from "./tabs/ClinicalDiagnosisTab";
import { MemberClaimHistoryTab } from "./tabs/MemberClaimHistoryTab";

function filterMatchingPreAuths(
  preAuths: ManageClaimsPreAuthOption[],
  criteria: {
    memberNo: string;
    provider: string;
    anniv: string;
    claimNature: string;
  }
): ManageClaimsPreAuthOption[] {
  const memberNo = criteria.memberNo.trim();
  const provider = criteria.provider.trim();
  const anniv = criteria.anniv.trim();
  const claimNature = criteria.claimNature.trim();
  if (!memberNo || !provider || !anniv || !claimNature) return [];

  return preAuths.filter((row) => {
    if (row.memberNo !== memberNo) return false;
    if (row.providerCode !== provider) return false;
    if (Number(row.anniv) !== Number(anniv)) return false;
    if (Number(row.authorityType) !== Number(claimNature)) return false;
    return true;
  });
}

function resolveFundFromMemberBenefit(
  memberBenefits: ManageClaimsMemberBenefitOption[],
  anniv: string,
  claimNature: string
): string {
  const annivKey = anniv.trim();
  const benefitKey = claimNature.trim();
  if (!annivKey || !benefitKey) return "0";
  const match = memberBenefits.find(
    (row) => row.anniv === annivKey && row.benefit === benefitKey
  );
  return match?.fund === "1" ? "1" : "0";
}

type ManageClaimsFormProps = {
  embedded?: boolean;
  claimId?: string;
  initialDetails?: Partial<ClaimDetailsFormData>;
  initialClaimForm?: Partial<ClaimFormTabData>;
  initialLineItems?: ClaimLineItemFormData[];
  initialDiagnoses?: ClaimDiagnosisFormData[];
  memberAnniversaries?: ManageClaimsMemberAnniversary[];
  memberBenefits?: ManageClaimsMemberBenefitOption[];
  entrantBatches?: ManageClaimsBatchOption[];
  memberPreAuths?: ManageClaimsPreAuthOption[];
  providerOptions?: LookupOption[];
  serviceOptions?: LookupOption[];
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function ManageClaimsForm({
  embedded = false,
  claimId,
  initialDetails,
  initialClaimForm,
  initialLineItems,
  initialDiagnoses,
  memberAnniversaries = [],
  memberBenefits = [],
  entrantBatches = [],
  memberPreAuths = [],
  providerOptions = [],
  serviceOptions = [],
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
  const [diagnoses, setDiagnoses] = useState<ClaimDiagnosisFormData[]>(
    initialDiagnoses ?? [
      defaultClaimDiagnosis({
        claimNo: initialDetails?.claimNo ?? defaultClaimDetailsForm.claimNo,
        memberNo: initialDetails?.memberNo ?? defaultClaimDetailsForm.memberNo,
      }),
    ]
  );
  const [preAuthModalOpen, setPreAuthModalOpen] = useState(false);
  const [viewPreAuthCode, setViewPreAuthCode] = useState<string | null>(null);

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

  const matchingPreAuths = useMemo(
    () =>
      filterMatchingPreAuths(memberPreAuths, {
        memberNo: details.memberNo,
        provider: details.provider,
        anniv: details.anniv,
        claimNature: details.claimNature,
      }),
    [
      details.anniv,
      details.claimNature,
      details.memberNo,
      details.provider,
      memberPreAuths,
    ]
  );

  const claimNatureLabel = useMemo(() => {
    const option = claimNatureOptions.find(
      (row) => row.value === details.claimNature
    );
    return option?.label ?? details.claimNature;
  }, [claimNatureOptions, details.claimNature]);

  const viewMemberBenefits = useMemo(
    () =>
      memberBenefits.map((benefit) => ({
        benefit: benefit.benefit,
        label: benefit.label,
        anniv: benefit.anniv,
        policyLimit: "",
        bedLimit: "",
        hospitalWard: "",
        sharing: "",
        utilisationLimit: "",
      })),
    [memberBenefits]
  );

  const viewCoverPeriods = useMemo(
    () =>
      memberAnniversaries.map((period) => ({
        anniv: period.anniv,
        startDate: period.startDate,
        endDate: period.endDate,
      })),
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
    const invoiceDate = details.invoiceDate.trim();
    setDetails((prev) => {
      if (!prev.dateReceived.trim()) return prev;
      if (invoiceDate && prev.dateReceived >= invoiceDate) return prev;
      return { ...prev, dateReceived: "" };
    });
    setClaimForm((prev) => {
      const clearIfBefore = (value: string) =>
        value && (!invoiceDate || value < invoiceDate) ? "" : value;
      const doctorDate = clearIfBefore(prev.doctorDate);
      const dateAdmitted = clearIfBefore(prev.dateAdmitted);
      const dateDischarged = clearIfBefore(prev.dateDischarged);
      if (
        doctorDate === prev.doctorDate &&
        dateAdmitted === prev.dateAdmitted &&
        dateDischarged === prev.dateDischarged
      ) {
        return prev;
      }
      return {
        ...prev,
        doctorDate,
        dateAdmitted,
        dateDischarged,
      };
    });
  }, [details.invoiceDate]);

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
      const nextClaimNature = claimNatureStillValid ? prev.claimNature : "";
      return {
        ...prev,
        anniv: nextAnniv,
        claimNature: nextClaimNature,
        preAuthNo: claimNatureStillValid ? prev.preAuthNo : "",
        fund: resolveFundFromMemberBenefit(
          memberBenefits,
          nextAnniv,
          nextClaimNature
        ),
      };
    });
  }, [details.invoiceDate, memberAnniversaries, memberBenefits]);

  useEffect(() => {
    const nextFund = resolveFundFromMemberBenefit(
      memberBenefits,
      details.anniv,
      details.claimNature
    );
    setDetails((prev) =>
      prev.fund === nextFund ? prev : { ...prev, fund: nextFund }
    );
  }, [details.anniv, details.claimNature, memberBenefits]);

  useEffect(() => {
    const claimNo = details.claimNo.trim();
    const memberNo = details.memberNo.trim();
    setDiagnoses((prev) => {
      if (prev.length === 0) return prev;
      let changed = false;
      const next = prev.map((row) => {
        if (row.claimNo === claimNo && row.memberNo === memberNo) return row;
        changed = true;
        return { ...row, claimNo, memberNo };
      });
      return changed ? next : prev;
    });
  }, [details.claimNo, details.memberNo]);

  useEffect(() => {
    if (!details.preAuthNo.trim()) return;
    const stillValid = matchingPreAuths.some(
      (row) => row.code === details.preAuthNo.trim()
    );
    if (stillValid) return;
    setDetails((prev) =>
      prev.preAuthNo ? { ...prev, preAuthNo: "" } : prev
    );
  }, [details.preAuthNo, matchingPreAuths]);

  const openPreAuthModal = () => {
    if (matchingPreAuths.length === 0) return;
    setPreAuthModalOpen(true);
  };

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
          preAuthNo: "",
        };
      }
      if (name === "claimNature") {
        return {
          ...prev,
          claimNature: value,
          preAuthNo: "",
          fund: resolveFundFromMemberBenefit(
            memberBenefits,
            prev.anniv,
            value
          ),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });

    if (name === "claimNature" && value.trim()) {
      const matches = filterMatchingPreAuths(memberPreAuths, {
        memberNo: details.memberNo,
        provider: details.provider,
        anniv: details.anniv,
        claimNature: value,
      });
      if (matches.length > 0) {
        setPreAuthModalOpen(true);
      }
    }
  };

  const handleAttachPreAuth = (code: string) => {
    setDetails((prev) => ({ ...prev, preAuthNo: code }));
    setPreAuthModalOpen(false);
  };

  const handleDetachPreAuth = () => {
    setDetails((prev) => ({ ...prev, preAuthNo: "" }));
    setPreAuthModalOpen(false);
  };

  const handleViewPreAuth = (code: string) => {
    setViewPreAuthCode(code);
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

  const handleDiagnosisChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "claimNo" || name === "memberNo") return;
    setDiagnoses((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [name]: value } : row
      )
    );
  };

  const handleAddDiagnosis = () => {
    setDiagnoses((prev) => [
      ...prev,
      defaultClaimDiagnosis({
        claimNo: details.claimNo,
        memberNo: details.memberNo,
      }),
    ]);
  };

  const handleRemoveDiagnosis = (index: number) => {
    setDiagnoses((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
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
            serviceOptions={serviceOptions}
            claimNatureOptions={claimNatureOptions}
            batchNoOptions={batchNoOptions}
            invoiceDateMin={invoiceDateBounds.min}
            invoiceDateMax={invoiceDateBounds.max}
            onManagePreAuth={openPreAuthModal}
            hasMatchingPreAuths={matchingPreAuths.length > 0}
          />
        );
      case "claimForm":
        return (
          <ClaimFormTab
            value={claimForm}
            onChange={handleClaimFormChange}
            invoiceDate={details.invoiceDate}
            diagnoses={diagnoses}
            onDiagnosisChange={handleDiagnosisChange}
            onAddDiagnosis={handleAddDiagnosis}
            onRemoveDiagnosis={handleRemoveDiagnosis}
          />
        );
      case "clinicalDiagnosis":
        return (
          <ClinicalDiagnosisTab
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

  const preAuthModals = (
    <>
      <AttachPreAuthModal
        open={preAuthModalOpen}
        onClose={() => setPreAuthModalOpen(false)}
        matches={matchingPreAuths}
        attachedCode={details.preAuthNo}
        onAttach={handleAttachPreAuth}
        onDetach={handleDetachPreAuth}
        onView={handleViewPreAuth}
        claimNatureLabel={claimNatureLabel}
      />
      <ViewPreAuthModal
        open={Boolean(viewPreAuthCode)}
        code={viewPreAuthCode}
        onClose={() => setViewPreAuthCode(null)}
        providerOptions={providerOptions}
        memberBenefits={viewMemberBenefits}
        coverPeriods={viewCoverPeriods}
      />
    </>
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
        {preAuthModals}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formBody}
      {formActions}
      {preAuthModals}
    </form>
  );
}
