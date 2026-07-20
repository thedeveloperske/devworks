import type { BenefitField, BenefitFormData } from "./types";

export const defaultBenefitForm: BenefitFormData = {
  benefit: "",
  beneClass: "",
};

export const benefitFields: BenefitField[] = [
  { name: "benefit", label: "Benefit *", required: true },
  { name: "beneClass", label: "Bene Class" },
];

export const benefitFieldNames: (keyof BenefitFormData)[] = ["benefit", "beneClass"];

export function getBenefitFields(names: (keyof BenefitFormData)[]) {
  return benefitFields.filter((field) => names.includes(field.name));
}
