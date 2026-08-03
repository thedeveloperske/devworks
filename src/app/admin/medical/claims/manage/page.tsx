import { Suspense } from "react";
import { ManageClaimsPageClient } from "@/features/medical/claims/manage";
import { loadManageClaimsPageData } from "@/features/medical/claims/manage/server/load-page-data";

async function ManageClaimsContent() {
  const { providers, providerOptions, corporates, members, memberAnniversaries } =
    await loadManageClaimsPageData();
  return (
    <ManageClaimsPageClient
      providers={providers}
      providerOptions={providerOptions}
      corporates={corporates}
      members={members}
      memberAnniversaries={memberAnniversaries}
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
