import { Suspense } from "react";
import { MemberRenewPageClient } from "@/features/medical/members/components";
import { loadMemberRenewPageData } from "@/features/medical/members/server/load-renew-page-data";

async function MemberRenewContent() {
  const { members, corporates } = await loadMemberRenewPageData();
  return <MemberRenewPageClient members={members} corporates={corporates} />;
}

export default function MemberRenewPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[12px] text-slate-500">
          Loading member renewals...
        </div>
      }
    >
      <MemberRenewContent />
    </Suspense>
  );
}
