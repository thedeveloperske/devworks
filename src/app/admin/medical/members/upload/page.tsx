import { Suspense } from "react";
import { MemberUploadPageClient } from "@/features/medical/members/components";

export default function MemberUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[12px] text-slate-500">Loading upload...</div>
      }
    >
      <MemberUploadPageClient />
    </Suspense>
  );
}
