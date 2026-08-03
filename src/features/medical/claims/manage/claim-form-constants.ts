import type { ClaimFormTabData, ClaimFormTabField } from "./types";

export const defaultClaimFormTab: ClaimFormTabData = {
  claimNo: "",
  visitDate: "",
  attendingDoc: "",
  doctorSign: "0",
  doctorDate: "",
  claimFormSigned: "0",
  dateAdmitted: "",
  dateDischarged: "",
  userId: "",
  dateEntered: "",
  visitDays: "",
};

/** All claim_form columns kept for persistence (including hidden UI fields). */
export const claimFormTabFields: ClaimFormTabField[] = [
  {
    name: "claimNo",
    label: "Claim No *",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "visitDate",
    label: "Visit Date *",
    type: "date",
    required: true,
    className: "sm:col-span-2",
  },
  {
    name: "doctorSign",
    label: "Doctor Sign",
    as: "switch",
    className: "sm:col-span-1",
  },
  {
    name: "claimFormSigned",
    label: "Patient Sign",
    as: "switch",
    className: "sm:col-span-1",
  },
  {
    name: "doctorDate",
    label: "Doctor Date",
    type: "date",
    className: "sm:col-span-2",
  },
  {
    name: "dateAdmitted",
    label: "Date Admitted",
    type: "date",
    className: "sm:col-span-2",
  },
  {
    name: "dateDischarged",
    label: "Date Discharged",
    type: "date",
    className: "sm:col-span-2",
  },
  {
    name: "visitDays",
    label: "Visit Days",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "attendingDoc",
    label: "Attending Doctor",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "userId",
    label: "User ID",
    className: "sm:col-span-2",
  },
  {
    name: "dateEntered",
    label: "Date Entered",
    type: "date",
    className: "sm:col-span-2",
  },
];

const visibleClaimFormFieldNames = new Set<keyof ClaimFormTabData>([
  "claimNo",
  "visitDate",
  "doctorSign",
  "claimFormSigned",
  "doctorDate",
  "dateAdmitted",
  "dateDischarged",
]);

/** Fields shown on the Claim Form tab UI. */
export const visibleClaimFormTabFields = claimFormTabFields.filter((field) =>
  visibleClaimFormFieldNames.has(field.name)
);
