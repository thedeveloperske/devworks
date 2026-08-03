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

export type ManageClaimsListItem = {
  id: string;
  claimNo: string;
  memberNo: string;
  memberName: string;
  providerName: string;
  claimDate: string;
};

export type ManageClaimsProviderSummary = {
  providerCode: string;
  providerName: string;
  claimsCount: number;
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
  anniv: string;
  cancelled: number | null;
};
