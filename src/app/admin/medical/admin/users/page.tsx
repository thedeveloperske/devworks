import { Suspense } from "react";
import { UsersPageClient } from "@/features/medical/admin/users/components";
import { loadUsersPageData } from "@/features/medical/admin/users/server/load-page-data";

async function UsersContent() {
  const { users } = await loadUsersPageData();
  return <UsersPageClient users={users} />;
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="text-[12px] text-slate-500">Loading users...</div>}>
      <UsersContent />
    </Suspense>
  );
}
