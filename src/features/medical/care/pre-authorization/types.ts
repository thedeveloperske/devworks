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

export type PreAuthorizationField = {
  name: keyof PreAuthorizationFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  as?: "input" | "select" | "textarea";
};
