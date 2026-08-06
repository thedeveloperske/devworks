import type {
  ClaimLineItemField,
  ClaimLineItemFormData,
} from "./types";

export const defaultClaimLineItem = (): ClaimLineItemFormData => ({
  service: "",
  invoiceNo: "",
  itemCode: "",
  itemName: "",
  groupName: "",
  quantity: "1",
  amount: "0",
  unitPrice: "0",
});

export const claimLineItemFields: ClaimLineItemField[] = [
  { name: "service", label: "Service", as: "select", required: true },
  { name: "invoiceNo", label: "Invoice No", required: true },
  { name: "itemName", label: "Item Name" },
  { name: "quantity", label: "Qty", type: "number" },
  { name: "unitPrice", label: "Unit Price", type: "number" },
  { name: "amount", label: "Amount", type: "number" },
];
