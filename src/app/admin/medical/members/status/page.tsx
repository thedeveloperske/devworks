import { Suspense } from "react";
import { MemberStatusPageClient } from "@/features/medical/members/components";
import { loadMemberStatusPageData } from "@/features/medical/members/server/load-status-page-data";

async function MemberStatusContent() {
  const { members, corporates } = await loadMemberStatusPageData();
  return <MemberStatusPageClient members={members} corporates={corporates} />;
}

export default function MemberStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="text-[12px] text-slate-500">
          Loading member status...
        </div>
      }
    >
      <MemberStatusContent />
    </Suspense>
  );
}
