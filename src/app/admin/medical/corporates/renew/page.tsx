import { Suspense } from "react";
import { RenewCorporatePageClient } from "@/features/medical/corporates/components";
import { loadCorporatesPageData } from "@/features/medical/corporates/server/load-page-data";

async function RenewCorporateContent() {
  const {
    corporates,
    agentOptions,
    benefitOptions,
    categoryOptions,
    providerOptions,
  } = await loadCorporatesPageData();

  return (
    <RenewCorporatePageClient
      corporates={corporates}
      agentOptions={agentOptions}
      benefitOptions={benefitOptions}
      categoryOptions={categoryOptions}
      providerOptions={providerOptions}
    />
  );
}

export default function RenewCorporatePage() {
  return (
    <Suspense
      fallback={
        <div className="text-[12px] text-slate-500">
          Loading corporates...
        </div>
      }
    >
      <RenewCorporateContent />
    </Suspense>
  );
}
