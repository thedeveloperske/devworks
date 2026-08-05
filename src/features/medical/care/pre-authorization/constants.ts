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
  {
    name: "memberNo",
    label: "Member No *",
    required: true,
    className: "sm:col-span-1",
  },
  {
    name: "provider",
    label: "Provider *",
    required: true,
    as: "select",
    className: "sm:col-span-1",
  },
  {
    name: "anniv",
    label: "Anniv",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "dateReported",
    label: "Date Reported",
    type: "date",
    className: "sm:col-span-1",
  },
  {
    name: "reportedBy",
    label: "Reported By",
    className: "sm:col-span-1",
  },
  {
    name: "authorityType",
    label: "Authority Type",
    as: "select",
    className: "sm:col-span-1",
  },
  {
    name: "ward",
    label: "Ward",
    as: "select",
    className: "sm:col-span-1",
  },
  {
    name: "availableLimit",
    label: "Available Limit",
    className: "sm:col-span-1",
  },
  {
    name: "bedLimit",
    label: "Bed Limit",
    className: "sm:col-span-1",
  },
  {
    name: "admitDays",
    label: "Admit Days",
    type: "number",
    className: "sm:col-span-1",
  },
  {
    name: "reserve",
    label: "Reserve",
    className: "sm:col-span-1",
  },
  {
    name: "preDiagnosis",
    label: "Pre Diagnosis",
    className: "sm:col-span-1",
  },
  {
    name: "clinicalProcedure",
    label: "Clinical Procedure",
    className: "sm:col-span-1",
  },
  {
    name: "notes",
    label: "Notes",
    as: "textarea",
    className: "sm:col-span-3",
  },
  { name: "dateAuthorized", label: "Date Authorized", type: "date", className: "sm:col-span-1" },
  { name: "authorizedBy", label: "Authorized By", className: "sm:col-span-1" },
  { name: "coSignee", label: "Co-Signee", className: "sm:col-span-1" },
  { name: "doctor1", label: "Doctor 1", className: "sm:col-span-1" },
  { name: "doctor2", label: "Doctor 2", className: "sm:col-span-1" },
  { name: "batchNo", label: "Batch No", type: "number", className: "sm:col-span-1" },
  { name: "validityDate", label: "Validity Date", type: "date", className: "sm:col-span-1" },
  { name: "careNotes", label: "Care Notes", as: "textarea", className: "sm:col-span-3" },
];

/** Visible fields, ordered for responsive capture layout. */
export const preAuthorizationFieldNames: (keyof PreAuthorizationFormData)[] = [
  "memberNo",
  "provider",
  "anniv",
  "dateReported",
  "reportedBy",
  "authorityType",
  "ward",
  "availableLimit",
  "bedLimit",
  "admitDays",
  "reserve",
  "preDiagnosis",
  "clinicalProcedure",
  "notes",
];

export const preAuthorizationFormSections: {
  title: string;
  fields: (keyof PreAuthorizationFormData)[];
}[] = [
  {
    title: "Request",
    fields: [
      "memberNo",
      "provider",
      "anniv",
      "dateReported",
      "reportedBy",
      "authorityType",
      "ward",
      "availableLimit",
      "bedLimit",
      "admitDays",
      "reserve",
    ],
  },
  {
    title: "Clinical",
    fields: ["preDiagnosis", "clinicalProcedure"],
  },
  {
    title: "Notes",
    fields: ["notes"],
  },
];

export function getPreAuthorizationFields(
  names: (keyof PreAuthorizationFormData)[]
) {
  const byName = new Map(
    preAuthorizationFields.map((field) => [field.name, field])
  );
  return names.flatMap((name) => {
    const field = byName.get(name);
    return field ? [field] : [];
  });
}
