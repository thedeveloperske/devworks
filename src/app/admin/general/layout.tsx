import { UserAvatarMenu } from "@/components/auth/UserAvatarMenu";
import { ADMIN_SYSTEMS } from "@/lib/admin-systems";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GeneralAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const system = ADMIN_SYSTEMS.general;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-maroon">{system.label}</p>
            <p className="text-[12px] text-slate-500">Application workspace</p>
          </div>
          <UserAvatarMenu name={session.name} email={session.email} />
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
