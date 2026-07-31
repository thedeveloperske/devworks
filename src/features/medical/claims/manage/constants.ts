export const manageClaimsTabs = [
  { id: "claimDetails", label: "Claim Details" },
  { id: "claimForm", label: "Claim Form" },
  { id: "clinicalDiagnosis", label: "Clinical Diagnosis" },
  { id: "claimStatus", label: "Claim Status" },
] as const;

export type ManageClaimsTabId = (typeof manageClaimsTabs)[number]["id"];

export const defaultManageClaimsTab: ManageClaimsTabId = "claimDetails";
