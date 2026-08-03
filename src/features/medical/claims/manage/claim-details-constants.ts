import type {
  ClaimDetailsField,
  ClaimDetailsFormData,
} from "./types";

/** All bills columns kept for persistence (including hidden UI fields). */
export const defaultClaimDetailsForm: ClaimDetailsFormData = {
  claimNo: "",
  invoiceNo: "",
  claimFormNo: "",
  provider: "",
  memberNo: "",
  service: "",
  claimNature: "",
  referredBy: "",
  ipDoctor: "",
  invoiceDate: "",
  invoicedAmount: "",
  deductionAmount: "",
  deductionReason: "",
  amountPayable: "",
  deductionNotes: "",
  batchNo: "",
  dateReceived: "",
  anniv: "",
  preAuthNo: "",
  corpId: "",
  familyNo: "",
  priDep: "",
  entryNotes: "",
  notes: "",
  lossDate: "",
  discAmount: "",
  adminFee: "",
  adminFeeRate: "",
  filledClaimForm: "",
  claimForm: "",
  itemized: "",
  lou: "",
  stamped: "",
  batched: "",
  claimSource: "",
  billSerialNo: "",
  refund: "0",
  fund: "0",
  proxyPayee: "",
};

/** Pay-to options stored in bills.refund */
export const claimPayToOptions = [
  { value: "0", label: "Provider" },
  { value: "1", label: "Reimburse Corporate" },
  { value: "2", label: "Reimburse Member" },
  { value: "3", label: "Reimburse Proxy" },
  { value: "4", label: "Reimburse Agent" },
] as const;

export const CLAIM_PAY_TO_PROXY = "3";

/** Field defs for Claim Details (visible + hidden). */
export const claimDetailsFields: ClaimDetailsField[] = [
  {
    name: "claimNo",
    label: "Claim No *",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "invoiceNo",
    label: "Invoice No *",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "memberNo",
    label: "Member No *",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "provider",
    label: "Provider *",
    required: true,
    as: "select",
    className: "sm:col-span-3",
  },
  {
    name: "service",
    label: "Service *",
    required: true,
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "claimNature",
    label: "Claim Nature *",
    required: true,
    as: "select",
    className: "sm:col-span-2",
  },
  {
    name: "anniv",
    label: "Anniv",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "invoiceDate",
    label: "Invoice Date *",
    type: "date",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "dateReceived",
    label: "Date Received",
    type: "date",
    className: "sm:col-span-2",
  },
  {
    name: "invoicedAmount",
    label: "Invoiced Amount *",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "batchNo",
    label: "Batch No",
    as: "select",
    className: "sm:col-span-2",
  },
  {
    name: "preAuthNo",
    label: "Preauth No",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "claimSource",
    label: "Claim Source",
    className: "sm:col-span-2",
  },
  {
    name: "refund",
    label: "Pay to",
    as: "select",
    className: "sm:col-span-2",
  },
  {
    name: "fund",
    label: "Fund",
    as: "switch",
    className: "sm:col-span-1",
  },
  {
    name: "proxyPayee",
    label: "Proxy Payee",
    className: "sm:col-span-3",
  },
  // Hidden from UI — still in defaultClaimDetailsForm for DB persistence
  {
    name: "billSerialNo",
    label: "Bill Serial No",
    className: "sm:col-span-2",
  },
  {
    name: "claimFormNo",
    label: "Claim Form No",
    className: "sm:col-span-2",
  },
  {
    name: "lossDate",
    label: "Loss Date",
    type: "date",
    className: "sm:col-span-2",
  },
  {
    name: "deductionAmount",
    label: "Deduction Amount",
    className: "sm:col-span-2",
  },
  {
    name: "amountPayable",
    label: "Amount Payable",
    className: "sm:col-span-2",
  },
  {
    name: "deductionReason",
    label: "Deduction Reason",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "discAmount",
    label: "Discount Amount",
    className: "sm:col-span-2",
  },
  {
    name: "adminFee",
    label: "Admin Fee",
    className: "sm:col-span-2",
  },
  {
    name: "adminFeeRate",
    label: "Admin Fee Rate",
    className: "sm:col-span-2",
  },
  {
    name: "corpId",
    label: "Corp ID",
    className: "sm:col-span-2",
  },
  {
    name: "familyNo",
    label: "Family No",
    className: "sm:col-span-2",
  },
  {
    name: "priDep",
    label: "Pri/Dep",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "referredBy",
    label: "Referred By",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "ipDoctor",
    label: "IP Doctor",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "filledClaimForm",
    label: "Filled Claim Form",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "claimForm",
    label: "Claim Form",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "itemized",
    label: "Itemized",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "lou",
    label: "LOU",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "stamped",
    label: "Stamped",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "batched",
    label: "Batched",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "deductionNotes",
    label: "Deduction Notes",
    as: "textarea",
    rows: 2,
    className: "sm:col-span-6",
  },
  {
    name: "entryNotes",
    label: "Entry Notes",
    className: "sm:col-span-3",
  },
  {
    name: "notes",
    label: "Notes",
    className: "sm:col-span-3",
  },
];

const visibleClaimDetailsFieldNames = new Set<keyof ClaimDetailsFormData>([
  "claimNo",
  "invoiceNo",
  "memberNo",
  "provider",
  "service",
  "claimNature",
  "anniv",
  "invoiceDate",
  "dateReceived",
  "invoicedAmount",
  "batchNo",
  "preAuthNo",
  "claimSource",
  "refund",
  "fund",
  "proxyPayee",
]);

/** Fields shown on the Claim Details tab UI. */
export const visibleClaimDetailsFields = claimDetailsFields.filter((field) =>
  visibleClaimDetailsFieldNames.has(field.name)
);
