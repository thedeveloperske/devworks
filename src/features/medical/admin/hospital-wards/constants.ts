import type { HospitalWardField, HospitalWardFormData } from "./types";

export const defaultHospitalWardForm: HospitalWardFormData = {
  ward: "",
};

export const hospitalWardFields: HospitalWardField[] = [
  {
    name: "ward",
    label: "Ward *",
    required: true,
    placeholder: "e.g. General Ward",
  },
];

export const hospitalWardFieldNames: (keyof HospitalWardFormData)[] = ["ward"];

export function getHospitalWardFields(names: (keyof HospitalWardFormData)[]) {
  return hospitalWardFields.filter((field) => names.includes(field.name));
}
