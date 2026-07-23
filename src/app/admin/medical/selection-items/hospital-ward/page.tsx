import { Suspense } from "react";
import { HospitalWardsPageClient } from "@/features/medical/admin/hospital-wards/components";
import { loadHospitalWardsPageData } from "@/features/medical/admin/hospital-wards/server/load-page-data";

async function HospitalWardsContent() {
  const { wards } = await loadHospitalWardsPageData();
  return <HospitalWardsPageClient wards={wards} />;
}

export default function HospitalWardPage() {
  return (
    <Suspense
      fallback={<div className="text-[12px] text-slate-500">Loading hospital wards...</div>}
    >
      <HospitalWardsContent />
    </Suspense>
  );
}
