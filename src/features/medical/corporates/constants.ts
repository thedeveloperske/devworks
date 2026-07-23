import type {
  CategoryGroupField,
  CategoryGroupFormData,
  ContactPersonField,
  ContactPersonFormData,
  CorporateField,
  CorporateFormData,
  CorporateTabId,
  CoverDateField,
  CoverDateFormData,
  ProviderRestrictionField,
  ProviderRestrictionFormData,
  PremiumRateField,
  PremiumRateFormData,
  RenewalFormData,
  RenewCorporateTabId,
} from "./types";

export const defaultCorporateForm: CorporateFormData = {
  policyNo: "",
  businessClass: "",
  scheme: "",
  corporate: "",
  corpId: "",
  telNo: "",
  mobileNo: "",
  email: "",
  town: "",
  physicalLocation: "",
  agentId: "",
  branch: "",
  currency: "",
  channel: "",
};

export const defaultCoverDateForm: CoverDateFormData = {
  startDate: "",
  endDate: "",
  renewalDate: "",
  agentId: "",
  anniv: "1",
};

export const defaultContactPersonForm: ContactPersonFormData = {
  title: "",
  surname: "",
  firstName: "",
  otherNames: "",
  jobTitle: "",
  mobileNo: "",
  telNo: "",
  email: "",
};

export function createEmptyContactPersonRow(): ContactPersonFormData {
  return { ...defaultContactPersonForm };
}

export const defaultCategoryGroupForm: CategoryGroupFormData = {
  anniv: "",
  category: "",
  benefit: "",
  fund: "0",
  policyLimit: "",
  subLimitOf: "",
  sharing: "",
  copayAmount: "",
  waitingPeriod: "",
};

export function createEmptyCategoryGroupRow(): CategoryGroupFormData {
  return { ...defaultCategoryGroupForm };
}

export const defaultProviderRestrictionForm: ProviderRestrictionFormData = {
  provider: "",
  anniv: "",
};

export function createEmptyProviderRestrictionRow(): ProviderRestrictionFormData {
  return { ...defaultProviderRestrictionForm };
}

export const defaultPremiumRateForm: PremiumRateFormData = {
  benefit: "",
  premiumType: "",
  familySize: "",
  policyLimit: "",
  premium: "",
  minAge: "",
  maxAge: "",
};

export function createEmptyPremiumRateRow(): PremiumRateFormData {
  return { ...defaultPremiumRateForm };
}

export const defaultRenewalForm = (
  corporateId = ""
): RenewalFormData => ({
  corporateId,
  anniv: "",
  periodStart: "",
  periodEnd: "",
  renewalDate: "",
});

export const corporateFields = [
  { name: "policyNo", label: "Policy No" },
  { name: "businessClass", label: "Business Class" },
  { name: "scheme", label: "Abbrev" },
  { name: "corporate", label: "Corporate Name *", required: true },
  { name: "corpId", label: "Corp ID" },
  { name: "telNo", label: "Tel No" },
  { name: "mobileNo", label: "Mobile No" },
  { name: "email", label: "Email", type: "email" },
  { name: "town", label: "Town" },
  { name: "physicalLocation", label: "Physical Location" },
  { name: "agentId", label: "Intermediary" },
  { name: "branch", label: "Branch" },
  { name: "currency", label: "Currency", placeholder: "KES" },
  { name: "channel", label: "Channel" },
] satisfies CorporateField[];

export const corporateFieldNames: (keyof CorporateFormData)[] = [
  "policyNo",
  "businessClass",
  "scheme",
  "corporate",
  "corpId",
  "telNo",
  "mobileNo",
  "email",
  "town",
  "physicalLocation",
  "agentId",
  "branch",
  "currency",
  "channel",
];

export const coverDateFields = [
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
  { name: "renewalDate", label: "Renewal Date", type: "date" },
  { name: "agentId", label: "Intermediary" },
  { name: "anniv", label: "Anniv" },
] satisfies CoverDateField[];

export const contactPersonFields = [
  { name: "title", label: "Title" },
  { name: "surname", label: "Surname" },
  { name: "firstName", label: "First Name" },
  { name: "otherNames", label: "Other Names" },
  { name: "jobTitle", label: "Job Title", required: true },
  { name: "mobileNo", label: "Mobile No" },
  { name: "telNo", label: "Tel No" },
  { name: "email", label: "Email", type: "email" },
] satisfies ContactPersonField[];

export const categoryGroupFields = [
  { name: "anniv", label: "Anniv" },
  { name: "category", label: "Category", required: true },
  { name: "benefit", label: "Benefit" },
  { name: "fund", label: "Fund" },
  { name: "policyLimit", label: "Limit", type: "number" },
  { name: "subLimitOf", label: "Sub Limit Of" },
  { name: "sharing", label: "Sharing" },
  { name: "copayAmount", label: "Copay Amount", type: "number" },
  { name: "waitingPeriod", label: "Waiting Period" },
] satisfies CategoryGroupField[];

export const providerRestrictionFields = [
  { name: "anniv", label: "Anniv" },
  { name: "provider", label: "Provider", required: true },
] satisfies ProviderRestrictionField[];

export const premiumRateFields = [
  { name: "benefit", label: "Benefit", required: true },
  { name: "premiumType", label: "Premium Type", type: "number" },
  { name: "familySize", label: "Family Size" },
  { name: "policyLimit", label: "Limit", type: "number" },
  { name: "minAge", label: "Min Age", type: "number" },
  { name: "maxAge", label: "Max Age", type: "number" },
  { name: "premium", label: "Premium", type: "number" },
] satisfies PremiumRateField[];

export const corporateTabs: { id: CorporateTabId; label: string }[] = [
  { id: "corporate", label: "Corporate Information" },
  { id: "contact", label: "Contact Person" },
  { id: "categories", label: "Benefit Categorization" },
  { id: "providerRestrictions", label: "Provider Restrictions" },
  { id: "premiumRates", label: "Premium Rates" },
];

export const renewCorporateTabs: { id: RenewCorporateTabId; label: string }[] = [
  { id: "corporates", label: "Ready to Renew" },
  { id: "coverDates", label: "Cover Dates" },
  { id: "categories", label: "Benefit Categorization" },
  { id: "providerRestrictions", label: "Provider Restrictions" },
];

export function getCorporateFields(names: (keyof CorporateFormData)[]) {
  return corporateFields.filter((field) => names.includes(field.name));
}
