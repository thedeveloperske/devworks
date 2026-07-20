import { Suspense } from "react";
import { MembersPageClient } from "@/features/medical/members/components";
import { loadMembersPageData } from "@/features/medical/members/server/load-page-data";

async function MembersContent() {
  const {
    members,
    corporates,
    corporateOptions,
    principalOptions,
    agentOptions,
    benefitOptions,
  } = await loadMembersPageData();
  return (
    <MembersPageClient
      members={members}
      corporates={corporates}
      corporateOptions={corporateOptions}
      principalOptions={principalOptions}
      agentOptions={agentOptions}
      benefitOptions={benefitOptions}
    />
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={<div className="text-[12px] text-slate-500">Loading members...</div>}>
      <MembersContent />
    </Suspense>
  );
}
