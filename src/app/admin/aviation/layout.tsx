import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ADMIN_SYSTEMS } from "@/lib/admin-systems";

export const dynamic = "force-dynamic";

export default function AviationAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const system = ADMIN_SYSTEMS.aviation;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-maroon">{system.label}</p>
            <p className="text-[12px] text-slate-500">Application workspace</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/applications"
              className="text-[12px] font-semibold text-slate-600 hover:text-maroon"
            >
              Applications
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
