import type {
  MemberAnniversaryField,
  MemberAnniversaryFormData,
} from "./member-anniversary-types";

export const defaultMemberAnniversaryForm: MemberAnniversaryFormData = {
  memberNo: "",
  anniv: "1",
  startDate: "",
  endDate: "",
  renewalDate: "",
  userId: "",
  dateEntered: "",
  sync: "",
  renewalNotes: "",
  invoiceNo: "",
  commisRate: "",
  whtaxRate: "",
  sumInsured: "",
  statusUser: "",
  status: "",
  smartSync: "",
  branch: "",
  unitManager: "",
};

export function createEmptyMemberAnniversaryRow(
  defaults?: Partial<MemberAnniversaryFormData>
): MemberAnniversaryFormData {
  return {
    ...defaultMemberAnniversaryForm,
    ...defaults,
  };
}

export const memberAnniversaryFields = [
  { name: "memberNo", label: "Member No" },
  { name: "startDate", label: "Start Date *", type: "date", required: true },
  { name: "endDate", label: "End Date", type: "date" },
  { name: "renewalDate", label: "Renewal Date", type: "date" },
  { name: "anniv", label: "Anniversary *", type: "number", required: true },
  { name: "invoiceNo", label: "Invoice No" },
  { name: "sumInsured", label: "Sum Insured", type: "number" },
  { name: "commisRate", label: "Commission Rate", type: "number" },
  { name: "whtaxRate", label: "WH Tax Rate", type: "number" },
  { name: "renewalNotes", label: "Renewal Notes" },
  { name: "status", label: "Status", type: "number" },
  { name: "statusUser", label: "Status User" },
  { name: "branch", label: "Branch" },
  { name: "unitManager", label: "Unit Manager", type: "number" },
  { name: "userId", label: "User ID" },
  { name: "dateEntered", label: "Date Entered", type: "date" },
  { name: "sync", label: "Sync", type: "number" },
  { name: "smartSync", label: "Smart Sync", type: "number" },
] satisfies MemberAnniversaryField[];

export const memberAnniversaryFieldNames: (keyof MemberAnniversaryFormData)[] =
  ["memberNo", "startDate", "endDate", "renewalDate", "anniv"];

export function getMemberAnniversaryFields(
  names: (keyof MemberAnniversaryFormData)[]
): MemberAnniversaryField[] {
  const byName = new Map(
    memberAnniversaryFields.map((field) => [field.name, field])
  );
  return names.flatMap((name) => {
    const field = byName.get(name);
    return field ? [field] : [];
  });
}
