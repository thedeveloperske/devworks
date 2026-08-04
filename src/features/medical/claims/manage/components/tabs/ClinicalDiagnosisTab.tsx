"use client";

import type { ChangeEvent } from "react";
import type { ClaimLineItemFormData } from "@/features/medical/claims/manage/types";
import { ClaimLineItemsTable } from "./ClaimLineItemsTable";

type ClinicalDiagnosisTabProps = {
  lineItems: ClaimLineItemFormData[];
  onLineItemChange: (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
};

export function ClinicalDiagnosisTab({
  lineItems,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
}: ClinicalDiagnosisTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ClaimLineItemsTable
        rows={lineItems}
        onRowChange={onLineItemChange}
        onAddRow={onAddLineItem}
        onRemoveRow={onRemoveLineItem}
      />
    </div>
  );
}
