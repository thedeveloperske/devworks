import { Suspense } from "react";
import { PreAuthorizationPageClient } from "@/features/medical/care/pre-authorization/components";
import { loadPreAuthorizationPageData } from "@/features/medical/care/pre-authorization/server/load-page-data";

async function PreAuthorizationContent() {
  const {
    preAuthorizations,
    corporates,
    members,
    providerOptions,
    hospitalWardOptions,
  } = await loadPreAuthorizationPageData();
  return (
    <PreAuthorizationPageClient
      preAuthorizations={preAuthorizations}
      corporates={corporates}
      members={members}
      providerOptions={providerOptions}
      hospitalWardOptions={hospitalWardOptions}
    />
  );
}

export default function CarePreAuthorizationPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[11px] text-slate-500">
          Loading pre-authorizations...
        </div>
      }
    >
      <PreAuthorizationContent />
    </Suspense>
  );
}
