export const manageClaimsTabs = [
  { id: "tab-1", label: "Tab 1" },
  { id: "tab-2", label: "Tab 2" },
  { id: "tab-3", label: "Tab 3" },
] as const;

export type ManageClaimsTabId = (typeof manageClaimsTabs)[number]["id"];

export const defaultManageClaimsTab: ManageClaimsTabId = "tab-1";
