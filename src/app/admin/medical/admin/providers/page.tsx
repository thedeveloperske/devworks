import { Suspense } from "react";
import { ProvidersPageClient } from "@/features/medical/admin/providers/components";
import { loadProvidersPageData } from "@/features/medical/admin/providers/server/load-page-data";

async function ProvidersContent() {
  const { providers } = await loadProvidersPageData();
  return <ProvidersPageClient providers={providers} />;
}

export default function ProvidersPage() {
  return (
    <Suspense
      fallback={<div className="text-[12px] text-slate-500">Loading providers...</div>}
    >
      <ProvidersContent />
    </Suspense>
  );
}
