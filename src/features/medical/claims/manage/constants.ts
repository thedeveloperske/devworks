export const manageClaimsTabs = [
  { id: "claimDetails", label: "Claim Details" },
  { id: "claimForm", label: "Claim Form" },
  { id: "clinicalDiagnosis", label: "Line Items" },
  { id: "memberClaimHistory", label: "Claim History" },
  { id: "claimStatus", label: "Claim Status" },
] as const;

export type ManageClaimsTabId = (typeof manageClaimsTabs)[number]["id"];

/** Tabs shown during claim capture; claim status comes back at vetting. */
export const visibleManageClaimsTabs = manageClaimsTabs.filter(
  (tab) =>
    tab.id === "claimDetails" ||
    tab.id === "claimForm" ||
    tab.id === "clinicalDiagnosis" ||
    tab.id === "memberClaimHistory"
);

export const defaultManageClaimsTab: ManageClaimsTabId = "claimDetails";
