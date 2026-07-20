import type {
  MemberBenefitField,
  MemberBenefitFormData,
} from "./member-benefits-types";

export const defaultMemberBenefitForm: MemberBenefitFormData = {
  memberNo: "",
  benefit: "",
  anniv: "1",
  policyLimit: "",
  sharing: "",
  reInsurer: "",
  subLimitOf: "",
  suspended: "",
  suspendedDate: "",
  suspendReason: "",
  suspendUser: "",
  suspendedEntry: "",
  expense: "",
  balance: "",
  percent: "",
  status: "",
  reserve: "",
  claims: "",
  fund: "0",
  cap: "",
  copayAmount: "",
  corpId: "",
  changeFactor: "",
  ceiling: "",
  changeLimit: "",
  statusUser: "",
  verifyStatus: "",
  waitingPeriod: "",
  bedLimit: "",
  sync: "",
  allocateTo: "",
};

export function createEmptyMemberBenefitRow(
  defaults?: Partial<MemberBenefitFormData>
): MemberBenefitFormData {
  return {
    ...defaultMemberBenefitForm,
    ...defaults,
  };
}

export const memberBenefitFields = [
  { name: "memberNo", label: "Member No" },
  { name: "benefit", label: "Benefit *", required: true },
  { name: "subLimitOf", label: "Sub Limit Of" },
  { name: "policyLimit", label: "Limit", type: "number" },
  { name: "sharing", label: "Sharing" },
  { name: "anniv", label: "Anniv *", type: "number", required: true },
  { name: "waitingPeriod", label: "Waiting Period", type: "number" },
  { name: "bedLimit", label: "Bed Limit", type: "number" },
  { name: "fund", label: "Fund" },
  { name: "copayAmount", label: "Copay Amount", type: "number" },
  { name: "expense", label: "Expense", type: "number" },
  { name: "balance", label: "Balance", type: "number" },
  { name: "percent", label: "Percent", type: "number" },
  { name: "status", label: "Status" },
  { name: "reserve", label: "Reserve", type: "number" },
  { name: "claims", label: "Claims", type: "number" },
  { name: "cap", label: "Cap", type: "number" },
  { name: "ceiling", label: "Ceiling", type: "number" },
  { name: "reInsurer", label: "Re-Insurer", type: "number" },
  { name: "changeFactor", label: "Change Factor", type: "number" },
  { name: "changeLimit", label: "Change Limit", type: "number" },
  { name: "corpId", label: "Corp ID" },
  { name: "suspended", label: "Suspended", type: "number" },
  { name: "suspendedDate", label: "Suspended Date", type: "date" },
  { name: "suspendReason", label: "Suspend Reason", type: "number" },
  { name: "suspendUser", label: "Suspend User" },
  { name: "suspendedEntry", label: "Suspended Entry", type: "date" },
  { name: "statusUser", label: "Status User" },
  { name: "verifyStatus", label: "Verify Status", type: "number" },
  { name: "sync", label: "Sync", type: "number" },
  { name: "allocateTo", label: "Allocate To", type: "number" },
] satisfies MemberBenefitField[];

export const memberBenefitFieldNames: (keyof MemberBenefitFormData)[] = [
  "memberNo",
  "benefit",
  "subLimitOf",
  "policyLimit",
  "sharing",
  "anniv",
  "waitingPeriod",
  "bedLimit",
];

export function getMemberBenefitFields(
  names: (keyof MemberBenefitFormData)[]
): MemberBenefitField[] {
  const byName = new Map(
    memberBenefitFields.map((field) => [field.name, field])
  );
  return names.flatMap((name) => {
    const field = byName.get(name);
    return field ? [field] : [];
  });
}
