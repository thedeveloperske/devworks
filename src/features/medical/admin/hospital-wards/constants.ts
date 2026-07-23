import type { HospitalWardField, HospitalWardFormData } from "./types";

export const defaultHospitalWardForm: HospitalWardFormData = {
  code: "",
  ward: "",
};

export const hospitalWardFields = [
  {
    name: "code",
    label: "Code *",
    required: true,
    placeholder: "e.g. 1",
    type: "number",
  },
  {
    name: "ward",
    label: "Ward *",
    required: true,
    placeholder: "e.g. General Ward",
  },
] satisfies HospitalWardField[];

export const hospitalWardFieldNames: (keyof HospitalWardFormData)[] = [
  "code",
  "ward",
];

export function getHospitalWardFields(names: (keyof HospitalWardFormData)[]) {
  return hospitalWardFields.filter((field) => names.includes(field.name));
}
