import type { ServiceField, ServiceFormData } from "./types";

export const defaultServiceForm: ServiceFormData = {
  service: "",
};

export const serviceFields: ServiceField[] = [
  {
    name: "service",
    label: "Service *",
    required: true,
    placeholder: "e.g. Outpatient",
  },
];

export const serviceFieldNames: (keyof ServiceFormData)[] = ["service"];

export function getServiceFields(names: (keyof ServiceFormData)[]) {
  return serviceFields.filter((field) => names.includes(field.name));
}
