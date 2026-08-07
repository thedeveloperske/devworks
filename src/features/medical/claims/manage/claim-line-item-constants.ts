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

/** Sum of line-item amounts for bill invoiced_amount. */
export function sumClaimLineItemAmounts(
  rows: ClaimLineItemFormData[]
): string {
  const total = rows.reduce((sum, row) => {
    const amount = Number.parseFloat(row.amount || "0");
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  return String(Number(total.toFixed(2)));
}
