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
    className: "lg:col-span-3",
  },
  {
    name: "provider",
    label: "Provider *",
    required: true,
    as: "select",
    className: "lg:col-span-4",
  },
  {
    name: "anniv",
    label: "Anniv",
    type: "number",
    className: "lg:col-span-1",
  },
  {
    name: "dateReported",
    label: "Date Reported",
    type: "date",
    className: "lg:col-span-2",
  },
  {
    name: "reportedBy",
    label: "Reported By",
    className: "lg:col-span-2",
  },
  {
    name: "availableLimit",
    label: "Available Limit",
    className: "lg:col-span-3",
  },
  {
    name: "bedLimit",
    label: "Bed Limit",
    className: "lg:col-span-3",
  },
  {
    name: "admitDays",
    label: "Admit Days",
    type: "number",
    className: "lg:col-span-2",
  },
  {
    name: "reserve",
    label: "Reserve",
    className: "lg:col-span-4",
  },
  {
    name: "preDiagnosis",
    label: "Pre Diagnosis",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    name: "authorityType",
    label: "Authority Type",
    as: "select",
    className: "lg:col-span-3",
  },
  {
    name: "ward",
    label: "Ward",
    as: "select",
    className: "lg:col-span-3",
  },
  {
    name: "clinicalProcedure",
    label: "Clinical Procedure",
    className: "sm:col-span-2 lg:col-span-6",
  },
  {
    name: "notes",
    label: "Notes",
    as: "textarea",
    className: "sm:col-span-2 lg:col-span-12",
  },
  { name: "dateAuthorized", label: "Date Authorized", type: "date" },
  { name: "authorizedBy", label: "Authorized By" },
  { name: "coSignee", label: "Co-Signee" },
  { name: "doctor1", label: "Doctor 1" },
  { name: "doctor2", label: "Doctor 2" },
  { name: "batchNo", label: "Batch No", type: "number" },
  { name: "validityDate", label: "Validity Date", type: "date" },
  { name: "careNotes", label: "Care Notes", as: "textarea" },
];

/** Visible fields, ordered for responsive capture layout. */
export const preAuthorizationFieldNames: (keyof PreAuthorizationFormData)[] = [
  "memberNo",
  "provider",
  "anniv",
  "dateReported",
  "reportedBy",
  "availableLimit",
  "bedLimit",
  "admitDays",
  "reserve",
  "preDiagnosis",
  "authorityType",
  "ward",
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
      "availableLimit",
      "bedLimit",
      "admitDays",
      "reserve",
    ],
  },
  {
    title: "Clinical",
    fields: ["preDiagnosis", "authorityType", "ward", "clinicalProcedure"],
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
