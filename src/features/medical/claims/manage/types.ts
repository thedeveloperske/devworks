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
};

export type ClaimDetailsField = {
  name: keyof ClaimDetailsFormData;
  label: string;
  type?: "text" | "number" | "date";
  as?: "input" | "select" | "textarea";
  required?: boolean;
  className?: string;
  rows?: number;
};

export type ManageClaimsListItem = {
  id: string;
  claimNo: string;
  memberNo: string;
  memberName: string;
  providerName: string;
  claimDate: string;
};
