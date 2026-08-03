export const manageClaimsTabs = [
  { id: "claimDetails", label: "Claim Details" },
  { id: "claimForm", label: "Claim Form" },
  { id: "memberClaimHistory", label: "Member Claim History" },
  { id: "clinicalDiagnosis", label: "Clinical Diagnosis" },
  { id: "claimStatus", label: "Claim Status" },
] as const;

export type ManageClaimsTabId = (typeof manageClaimsTabs)[number]["id"];

/** Tabs shown during claim capture; diagnosis/status come back at vetting. */
export const visibleManageClaimsTabs = manageClaimsTabs.filter(
  (tab) =>
    tab.id === "claimDetails" ||
    tab.id === "claimForm" ||
    tab.id === "memberClaimHistory"
);

export const defaultManageClaimsTab: ManageClaimsTabId = "claimDetails";
