import { Suspense } from "react";
import { SelectionItemsPageClient } from "@/features/medical/admin/selection-items/components";

export default function SelectionItemsPage() {
  return (
    <Suspense
      fallback={<div className="text-[12px] text-slate-500">Loading selection items...</div>}
    >
      <SelectionItemsPageClient />
    </Suspense>
  );
}
