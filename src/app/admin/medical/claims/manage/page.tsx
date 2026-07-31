import { Suspense } from "react";
import { ManageClaimsPageClient } from "@/features/medical/claims/manage";

export default function ManageClaimsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[11px] text-slate-500">Loading manage claims...</div>
      }
    >
      <ManageClaimsPageClient />
    </Suspense>
  );
}
