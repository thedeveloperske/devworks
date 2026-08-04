import { Suspense } from "react";
import { ServicesPageClient } from "@/features/medical/admin/services/components";
import { loadServicesPageData } from "@/features/medical/admin/services/server/load-page-data";

async function ServicesContent() {
  const { services } = await loadServicesPageData();
  return <ServicesPageClient services={services} />;
}

export default function ServicePage() {
  return (
    <Suspense
      fallback={<div className="text-[11px] text-slate-500">Loading services...</div>}
    >
      <ServicesContent />
    </Suspense>
  );
}
