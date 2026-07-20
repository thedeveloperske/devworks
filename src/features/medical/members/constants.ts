import type { MemberField, MemberFormData } from "./types";
import type { MemberPrincipalTabId } from "./tab-types";

export const defaultMemberForm: MemberFormData = {
  memberNumber: "",
  firstName: "",
  lastName: "",
  corporateId: "",
  memberType: "PRINCIPAL",
  principalId: "",
  email: "",
  phone: "",
  status: "ACTIVE",
  dateOfBirth: "",
};

export const memberFields = [
  { name: "memberNumber", label: "Member No *", required: true },
  { name: "firstName", label: "First Name *", required: true },
  { name: "lastName", label: "Last Name *", required: true },
  { name: "corporateId", label: "Corporate *", required: true },
  { name: "memberType", label: "Member Type" },
  { name: "principalId", label: "Principal" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone" },
  { name: "status", label: "Status" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date" },
] satisfies MemberField[];

export const memberFieldNames: (keyof MemberFormData)[] = [
  "memberNumber",
  "firstName",
  "lastName",
  "corporateId",
  "memberType",
  "principalId",
  "email",
  "phone",
  "status",
  "dateOfBirth",
];

export const memberPrincipalTabs: {
  id: MemberPrincipalTabId;
  label: string;
}[] = [
  { id: "principalInformation", label: "Principal Information" },
  { id: "bioData", label: "Bio Data" },
  { id: "benefits", label: "Benefits" },
  { id: "medicalDetails", label: "Medical Details" },
  { id: "historyOfCover", label: "History of Cover" },
  { id: "acceptance", label: "Acceptance" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

/** Tabs shown when capturing a dependant (no principal_applicant). */
export const memberDependantTabs: {
  id: MemberPrincipalTabId;
  label: string;
}[] = [
  { id: "bioData", label: "Bio Data" },
  { id: "benefits", label: "Benefits" },
  { id: "medicalDetails", label: "Medical Details" },
  { id: "historyOfCover", label: "History of Cover" },
  { id: "acceptance", label: "Acceptance" },
  { id: "miscellaneous", label: "Miscellaneous" },
];

export function getMemberFields(names: (keyof MemberFormData)[]) {
  return memberFields.filter((field) => names.includes(field.name));
}
