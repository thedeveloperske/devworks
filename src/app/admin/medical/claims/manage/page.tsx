import { Suspense } from "react";
import { ManageClaimsPageClient } from "@/features/medical/claims/manage";
import { loadManageClaimsPageData } from "@/features/medical/claims/manage/server/load-page-data";

async function ManageClaimsContent() {
  const { claims, providerOptions } = await loadManageClaimsPageData();
  return (
    <ManageClaimsPageClient
      claims={claims}
      providerOptions={providerOptions}
    />
  );
}

export default function ManageClaimsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[11px] text-slate-500">Loading manage claims...</div>
      }
    >
      <ManageClaimsContent />
    </Suspense>
  );
}
