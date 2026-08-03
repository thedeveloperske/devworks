import type {
  ClaimLineItemField,
  ClaimLineItemFormData,
} from "./types";

export const defaultClaimLineItem = (): ClaimLineItemFormData => ({
  service: "",
  description: "",
  quantity: "1",
  amount: "",
  notes: "",
});

export const claimLineItemFields: ClaimLineItemField[] = [
  { name: "service", label: "Service", type: "number" },
  { name: "description", label: "Description" },
  { name: "quantity", label: "Qty", type: "number" },
  { name: "amount", label: "Amount" },
  { name: "notes", label: "Notes" },
];
