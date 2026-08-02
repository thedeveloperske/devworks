import type { ClaimFormTabData, ClaimFormTabField } from "./types";

export const defaultClaimFormTab: ClaimFormTabData = {
  claimNo: "",
  visitDate: "",
  attendingDoc: "",
  doctorSign: "",
  doctorDate: "",
  claimFormSigned: "",
  dateAdmitted: "",
  dateDischarged: "",
  userId: "",
  dateEntered: "",
  visitDays: "",
};

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
    name: "doctorSign",
    label: "Doctor Signed",
    type: "number",
    className: "sm:col-span-2",
  },
  {
    name: "doctorDate",
    label: "Doctor Date",
    type: "date",
    className: "sm:col-span-2",
  },
  {
    name: "claimFormSigned",
    label: "Claim Form Signed",
    type: "number",
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
