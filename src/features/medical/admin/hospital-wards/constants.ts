import type { HospitalWardField, HospitalWardFormData } from "./types";

export const defaultHospitalWardForm: HospitalWardFormData = {
  ward: "",
};

export const hospitalWardFields = [
  {
    name: "ward",
    label: "Ward *",
    required: true,
    placeholder: "e.g. General Ward",
  },
] satisfies HospitalWardField[];

export const hospitalWardFieldNames: (keyof HospitalWardFormData)[] = ["ward"];

export function getHospitalWardFields(names: (keyof HospitalWardFormData)[]) {
  return hospitalWardFields.filter((field) => names.includes(field.name));
}
