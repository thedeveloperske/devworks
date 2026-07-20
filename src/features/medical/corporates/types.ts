export type CorporateFormData = {
  policyNo: string;
  businessClass: string;
  scheme: string;
  corporate: string;
  corpId: string;
  telNo: string;
  mobileNo: string;
  email: string;
  town: string;
  physicalLocation: string;
  agentId: string;
  branch: string;
  currency: string;
  channel: string;
};

export type CorporateInput = {
  policyNo?: string;
  businessClass?: string;
  scheme?: string;
  corporate?: string;
  corpId?: string;
  telNo?: string;
  mobileNo?: string;
  email?: string;
  town?: string;
  physicalLocation?: string;
  agentId?: string;
  branch?: string;
  currency?: string;
  channel?: string;
};

export type CoverDateInput = {
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  anniv?: string;
};

export type ContactPersonInput = {
  idx?: number | string;
  title?: string;
  surname?: string;
  firstName?: string;
  otherNames?: string;
  jobTitle?: string;
  mobileNo?: string;
  telNo?: string;
  email?: string;
};

export type CorporateSaveInput = CorporateInput & {
  coverDates?: CoverDateInput;
  contactPersons?: ContactPersonInput[];
  categoryGroups?: CategoryGroupInput[];
  providerRestrictions?: ProviderRestrictionInput[];
  premiumRates?: PremiumRateInput[];
};

export type CoverDateFormData = {
  startDate: string;
  endDate: string;
  renewalDate: string;
  agentId: string;
  anniv: string;
};

export type ContactPersonFormData = {
  idx?: number;
  title: string;
  surname: string;
  firstName: string;
  otherNames: string;
  jobTitle: string;
  mobileNo: string;
  telNo: string;
  email: string;
};

export type CategoryGroupInput = {
  idx?: number | string;
  anniv?: string;
  category?: string;
  benefit?: string;
  fund?: string;
  policyLimit?: string;
  subLimitOf?: string;
  sharing?: string;
  copayAmount?: string;
  waitingPeriod?: string;
};

export type CategoryGroupFormData = {
  idx?: number;
  anniv: string;
  category: string;
  benefit: string;
  fund: string;
  policyLimit: string;
  subLimitOf: string;
  sharing: string;
  copayAmount: string;
  waitingPeriod: string;
};

export type ProviderRestrictionInput = {
  idx?: number | string;
  provider?: string;
  anniv?: string;
};

export type ProviderRestrictionFormData = {
  idx?: number;
  provider: string;
  anniv: string;
};

export type PremiumRateInput = {
  idx?: number | string;
  benefit?: string;
  premiumType?: string;
  familySize?: string;
  policyLimit?: string;
  premium?: string;
  minAge?: string;
  maxAge?: string;
};

export type PremiumRateFormData = {
  idx?: number;
  benefit: string;
  premiumType: string;
  familySize: string;
  policyLimit: string;
  premium: string;
  minAge: string;
  maxAge: string;
};

export type CorporateListItem = {
  id: string;
  policyNo: string | null;
  businessClass: string | null;
  corporate: string;
  corpId: string | null;
  agentId: string | null;
  /** Latest cover period start (YYYY-MM-DD), "" when unknown. */
  corpStartDate?: string;
  /** Latest cover period end (YYYY-MM-DD), "" when unknown. */
  corpEndDate?: string;
};

export type CorporateOption = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
  /** Latest cover period start (YYYY-MM-DD), "" when unknown. */
  corpStartDate?: string;
  /** Latest cover period end (YYYY-MM-DD), "" when unknown. */
  corpEndDate?: string;
};

export type RenewalListItem = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
  anniv: number;
  periodStart: string;
  periodEnd: string;
  renewalDate: string;
  active: boolean;
};

export type RenewalFormData = {
  corporateId: string;
  anniv: string;
  periodStart: string;
  periodEnd: string;
  renewalDate: string;
};

export type CorporateTabId =
  | "corporate"
  | "contact"
  | "categories"
  | "providerRestrictions"
  | "premiumRates";

export type RenewCorporateTabId =
  | "coverDates"
  | "categories"
  | "corporates"
  | "providerRestrictions";

export type CorporateField = {
  name: keyof CorporateFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};

export type CoverDateField = {
  name: keyof CoverDateFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
};

export type ContactPersonField = {
  name: keyof ContactPersonFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};

export type CategoryGroupField = {
  name: keyof CategoryGroupFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};

export type ProviderRestrictionField = {
  name: keyof ProviderRestrictionFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};

export type PremiumRateField = {
  name: keyof PremiumRateFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
