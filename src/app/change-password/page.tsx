import { PageHeader } from "@/components/admin/PageHeader";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Change Password"
        description="Update your sign-in password"
      />
      <div className="mt-4 border border-slate-200 bg-white px-4 py-4 text-[12px] text-slate-600">
        Password change will be available in a later update.
      </div>
    </div>
  );
}
