import { Suspense } from "react";
import { ClaimsBatchingPageClient } from "@/features/medical/claims/batching/components";
import { loadClaimsBatchingPageData } from "@/features/medical/claims/batching/server/load-page-data";

async function ClaimsBatchingContent() {
  const { batches, providers, currentUserName } = await loadClaimsBatchingPageData();
  return (
    <ClaimsBatchingPageClient
      batches={batches}
      providers={providers}
      currentUserName={currentUserName}
    />
  );
}

export default function ClaimsBatchingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[12px] text-slate-500">Loading claims batching...</div>
      }
    >
      <ClaimsBatchingContent />
    </Suspense>
  );
}
