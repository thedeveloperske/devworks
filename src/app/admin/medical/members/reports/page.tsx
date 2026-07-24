import { Suspense } from "react";
import { MemberReportsPageClient } from "@/features/medical/members/components";

export default function MemberReportsPage() {
  return (
    <Suspense
      fallback={<div className="text-[12px] text-slate-500">Loading reports...</div>}
    >
      <MemberReportsPageClient />
    </Suspense>
  );
}
