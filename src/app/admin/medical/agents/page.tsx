import { Suspense } from "react";
import { AgentsPageClient } from "@/features/medical/admin/agents/components";
import { loadAgentsPageData } from "@/features/medical/admin/agents/server/load-page-data";

async function AgentsContent() {
  const { agents } = await loadAgentsPageData();
  return <AgentsPageClient agents={agents} />;
}

export default function AgentsPage() {
  return (
    <Suspense fallback={<div className="text-[12px] text-slate-500">Loading agents...</div>}>
      <AgentsContent />
    </Suspense>
  );
}
