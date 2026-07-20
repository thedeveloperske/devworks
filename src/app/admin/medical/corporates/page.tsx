import { Suspense } from "react";
import { CorporatesPageClient } from "@/features/medical/corporates/components";
import { loadCorporatesPageData } from "@/features/medical/corporates/server/load-page-data";

async function CorporatesContent() {
  const {
    corporates,
    agentOptions,
    benefitOptions,
    categoryOptions,
    providerOptions,
  } = await loadCorporatesPageData();
  return (
    <CorporatesPageClient
      corporates={corporates}
      agentOptions={agentOptions}
      benefitOptions={benefitOptions}
      categoryOptions={categoryOptions}
      providerOptions={providerOptions}
    />
  );
}

export default function CorporatesPage() {
  return (
    <Suspense fallback={<div className="text-[12px] text-slate-500">Loading corporates...</div>}>
      <CorporatesContent />
    </Suspense>
  );
}
