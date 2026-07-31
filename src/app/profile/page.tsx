import { PageHeader } from "@/components/admin/PageHeader";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Profile"
        description="Your account details"
      />
      <div className="mt-4 space-y-3 border border-slate-200 bg-white px-4 py-4 text-[12px]">
        <div>
          <p className="font-medium text-slate-500">Name</p>
          <p className="mt-0.5 font-semibold text-slate-900">{session.name}</p>
        </div>
        <div>
          <p className="font-medium text-slate-500">Username</p>
          <p className="mt-0.5 font-semibold text-slate-900">{session.email}</p>
        </div>
        <p className="pt-2 text-slate-500">
          Profile editing will be added in a later update.
        </p>
      </div>
    </div>
  );
}
