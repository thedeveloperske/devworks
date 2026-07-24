import type {
  PreAuthorizationField,
  PreAuthorizationFormData,
} from "./types";

export const defaultPreAuthorizationForm: PreAuthorizationFormData = {
  memberNo: "",
  provider: "",
  dateReported: "",
  reportedBy: "",
  dateAuthorized: "",
  authorizedBy: "",
  preDiagnosis: "",
  authorityType: "",
  ward: "",
  availableLimit: "",
  admitDays: "",
  reserve: "",
  notes: "",
  coSignee: "",
  anniv: "",
  clinicalProcedure: "",
  doctor1: "",
  doctor2: "",
  batchNo: "",
  bedLimit: "",
  validityDate: "",
  careNotes: "",
};

export const preAuthorizationFields: PreAuthorizationField[] = [
  { name: "memberNo", label: "Member No *", required: true },
  { name: "provider", label: "Provider *", required: true, as: "select" },
  { name: "dateReported", label: "Date Reported", type: "date" },
  { name: "reportedBy", label: "Reported By" },
  { name: "dateAuthorized", label: "Date Authorized", type: "date" },
  { name: "authorizedBy", label: "Authorized By" },
  { name: "preDiagnosis", label: "Pre Diagnosis" },
  { name: "authorityType", label: "Authority Type", type: "number" },
  { name: "ward", label: "Ward", as: "select" },
  { name: "availableLimit", label: "Available Limit" },
  { name: "admitDays", label: "Admit Days", type: "number" },
  { name: "reserve", label: "Reserve" },
  { name: "notes", label: "Notes", as: "textarea" },
  { name: "coSignee", label: "Co-Signee" },
  { name: "anniv", label: "Anniv", type: "number" },
  { name: "clinicalProcedure", label: "Clinical Procedure" },
  { name: "doctor1", label: "Doctor 1" },
  { name: "doctor2", label: "Doctor 2" },
  { name: "batchNo", label: "Batch No", type: "number" },
  { name: "bedLimit", label: "Bed Limit" },
  { name: "validityDate", label: "Validity Date", type: "date" },
  { name: "careNotes", label: "Care Notes", as: "textarea" },
];

export const preAuthorizationFieldNames: (keyof PreAuthorizationFormData)[] = [
  "memberNo",
  "provider",
  "dateReported",
  "reportedBy",
  "dateAuthorized",
  "authorizedBy",
  "preDiagnosis",
  "authorityType",
  "ward",
  "availableLimit",
  "admitDays",
  "reserve",
  "notes",
  "coSignee",
  "anniv",
  "clinicalProcedure",
  "doctor1",
  "doctor2",
  "batchNo",
  "bedLimit",
  "validityDate",
  "careNotes",
];

export function getPreAuthorizationFields(
  names: (keyof PreAuthorizationFormData)[]
) {
  return preAuthorizationFields.filter((field) => names.includes(field.name));
}
