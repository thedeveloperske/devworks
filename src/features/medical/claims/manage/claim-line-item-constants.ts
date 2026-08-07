import type {
  ClaimLineItemField,
  ClaimLineItemFormData,
} from "./types";
import { formatThousands, stripThousands } from "@/lib/format";

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
  { name: "unitPrice", label: "Unit Price" },
  { name: "amount", label: "Amount" },
];

export const claimLineItemAmountFields = new Set<keyof ClaimLineItemFormData>([
  "unitPrice",
  "amount",
]);

/** Sum of line-item amounts for bill invoiced_amount. */
export function sumClaimLineItemAmounts(
  rows: ClaimLineItemFormData[]
): string {
  const total = rows.reduce((sum, row) => {
    const amount = Number.parseFloat(stripThousands(row.amount || "0") || "0");
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  return formatThousands(total.toFixed(2));
}

export function computeClaimLineItemAmount(
  quantity: string,
  unitPrice: string
): string {
  const qty = Number.parseFloat(stripThousands(quantity || "0") || "0");
  const price = Number.parseFloat(stripThousands(unitPrice || "0") || "0");
  const computed =
    (Number.isFinite(qty) ? qty : 0) * (Number.isFinite(price) ? price : 0);
  return formatThousands(computed.toFixed(2));
}
