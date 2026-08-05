export type ClaimDetailsFormData = {
  claimNo: string;
  invoiceNo: string;
  claimFormNo: string;
  provider: string;
  memberNo: string;
  service: string;
  claimNature: string;
  referredBy: string;
  ipDoctor: string;
  invoiceDate: string;
  invoicedAmount: string;
  deductionAmount: string;
  deductionReason: string;
  amountPayable: string;
  deductionNotes: string;
  batchNo: string;
  dateReceived: string;
  anniv: string;
  preAuthNo: string;
  corpId: string;
  familyNo: string;
  priDep: string;
  entryNotes: string;
  notes: string;
  lossDate: string;
  discAmount: string;
  adminFee: string;
  adminFeeRate: string;
  filledClaimForm: string;
  claimForm: string;
  itemized: string;
  lou: string;
  stamped: string;
  batched: string;
  claimSource: string;
  billSerialNo: string;
  refund: string;
  fund: string;
  proxyPayee: string;
};

export type ClaimDetailsField = {
  name: keyof ClaimDetailsFormData;
  label: string;
  type?: "text" | "number" | "date";
  as?: "input" | "select" | "textarea" | "switch";
  required?: boolean;
  className?: string;
  rows?: number;
};

export type ClaimFormTabData = {
  claimNo: string;
  visitDate: string;
  attendingDoc: string;
  doctorSign: string;
  doctorDate: string;
  claimFormSigned: string;
  dateAdmitted: string;
  dateDischarged: string;
  userId: string;
  dateEntered: string;
  visitDays: string;
};

export type ClaimFormTabField = {
  name: keyof ClaimFormTabData;
  label: string;
  type?: "text" | "number" | "date";
  as?: "input" | "select" | "textarea" | "switch";
  required?: boolean;
  className?: string;
  rows?: number;
};

export type ClaimLineItemFormData = {
  service: string;
  description: string;
  quantity: string;
  amount: string;
  notes: string;
};

export type ClaimLineItemField = {
  name: keyof ClaimLineItemFormData;
  label: string;
  type?: "text" | "number";
  required?: boolean;
};

export type ClaimDiagnosisFormData = {
  claimNo: string;
  memberNo: string;
  diagnosis: string;
};

export type ClaimDiagnosisField = {
  name: keyof ClaimDiagnosisFormData;
  label: string;
  type?: "text" | "number";
  required?: boolean;
  readOnly?: boolean;
};

export type ManageClaimsListItem = {
  id: string;
  claimNo: string;
  memberNo: string;
  memberName: string;
  providerName: string;
  claimDate: string;
};

export type ManageClaimsCorporateOption = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
};

export type ManageClaimsMemberOption = {
  memberNo: string;
  familyNo: string;
  name: string;
  corporateId: string;
  corpId: string;
  memberType: "Principal" | "Dependant";
  cancelled: number | null;
};

export type ManageClaimsMemberAnniversary = {
  memberNo: string;
  anniv: string;
  startDate: string;
  endDate: string;
};

export type ManageClaimsMemberBenefitOption = {
  memberNo: string;
  benefit: string;
  label: string;
  anniv: string;
  fund: string;
};

export type ManageClaimsBatchOption = {
  id: string;
  batchNo: string;
  providerCode: string;
};

export type ManageClaimsPreAuthOption = {
  code: string;
  memberNo: string;
  providerCode: string;
  anniv: string;
  authorityType: string;
  dateAuthorized: string;
  validityDate: string;
  reserve: string;
  preDiagnosis: string;
};

export type ManageClaimsHistoryItem = {
  id: string;
  memberNo: string;
  provider: string;
  claimNo: string;
  service: string;
  benefit: string;
  invoiceDate: string;
  dateReceived: string;
  dateEntered: string;
  invoicedAmount: string;
};
