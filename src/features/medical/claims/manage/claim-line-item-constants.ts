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
  { name: "service", label: "Service", type: "number" },
  { name: "invoiceNo", label: "Invoice No" },
  { name: "itemCode", label: "Item Code" },
  { name: "itemName", label: "Item Name" },
  { name: "groupName", label: "Group Name" },
  { name: "quantity", label: "Qty", type: "number" },
  { name: "amount", label: "Amount", type: "number" },
  { name: "unitPrice", label: "Unit Price", type: "number" },
];
