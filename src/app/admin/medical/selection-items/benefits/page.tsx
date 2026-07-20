import { Suspense } from "react";
import { BenefitsPageClient } from "@/features/medical/admin/benefits/components";
import { loadBenefitsPageData } from "@/features/medical/admin/benefits/server/load-page-data";

async function BenefitsContent() {
  const { benefits } = await loadBenefitsPageData();
  return <BenefitsPageClient benefits={benefits} />;
}

export default function BenefitsPage() {
  return (
    <Suspense fallback={<div className="text-[12px] text-slate-500">Loading benefits...</div>}>
      <BenefitsContent />
    </Suspense>
  );
}
