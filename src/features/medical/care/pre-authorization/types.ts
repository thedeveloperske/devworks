export type PreAuthorizationFormData = {
  memberNo: string;
  provider: string;
  dateReported: string;
  reportedBy: string;
  dateAuthorized: string;
  authorizedBy: string;
  preDiagnosis: string;
  authorityType: string;
  ward: string;
  availableLimit: string;
  admitDays: string;
  reserve: string;
  notes: string;
  coSignee: string;
  anniv: string;
  clinicalProcedure: string;
  doctor1: string;
  doctor2: string;
  batchNo: string;
  bedLimit: string;
  validityDate: string;
  careNotes: string;
};

export type PreAuthorizationInput = Partial<PreAuthorizationFormData>;

export type PreAuthorizationListItem = {
  id: string;
  code: number;
  memberNo: string;
  provider: string;
  providerName: string | null;
  dateReported: string | null;
  reportedBy: string | null;
  dateAuthorized: string | null;
  authorizedBy: string | null;
  preDiagnosis: string | null;
  validityDate: string | null;
};

export type PreAuthorizationCorporateOption = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
};

export type PreAuthorizationMemberBenefitOption = {
  benefit: string;
  label: string;
  anniv: string;
  policyLimit: string;
  bedLimit: string;
  hospitalWard: string;
};

export type PreAuthorizationMemberOption = {
  memberNo: string;
  familyNo: string;
  name: string;
  corporateId: string;
  corpId: string;
  memberType: "Principal" | "Dependant";
  anniv: string;
  cancelled: number | null;
  benefits: PreAuthorizationMemberBenefitOption[];
};

export type PreAuthorizationField = {
  name: keyof PreAuthorizationFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  as?: "input" | "select" | "textarea";
  /** Grid column span classes for responsive layout. */
  className?: string;
};
