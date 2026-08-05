import { Suspense } from "react";
import { ManageClaimsPageClient } from "@/features/medical/claims/manage";
import { loadManageClaimsPageData } from "@/features/medical/claims/manage/server/load-page-data";

async function ManageClaimsContent() {
  const {
    providerOptions,
    serviceOptions,
    corporates,
    members,
    memberAnniversaries,
    memberBenefits,
    entrantBatches,
    memberPreAuths,
  } = await loadManageClaimsPageData();
  return (
    <ManageClaimsPageClient
      providerOptions={providerOptions}
      serviceOptions={serviceOptions}
      corporates={corporates}
      members={members}
      memberAnniversaries={memberAnniversaries}
      memberBenefits={memberBenefits}
      entrantBatches={entrantBatches}
      memberPreAuths={memberPreAuths}
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
