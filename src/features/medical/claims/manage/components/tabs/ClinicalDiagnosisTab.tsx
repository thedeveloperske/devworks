"use client";

import type { ChangeEvent } from "react";
import type { ClaimLineItemFormData } from "@/features/medical/claims/manage/types";
import type { LookupOption } from "@/features/medical/lookups/types";
import { ClaimLineItemsTable } from "./ClaimLineItemsTable";

type ClinicalDiagnosisTabProps = {
  lineItems: ClaimLineItemFormData[];
  onLineItemChange: (
    index: number,
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (index: number) => void;
  serviceOptions?: LookupOption[];
};

export function ClinicalDiagnosisTab({
  lineItems,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
  serviceOptions = [],
}: ClinicalDiagnosisTabProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ClaimLineItemsTable
        rows={lineItems}
        onRowChange={onLineItemChange}
        onAddRow={onAddLineItem}
        onRemoveRow={onRemoveLineItem}
        serviceOptions={serviceOptions}
      />
    </div>
  );
}
