import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plane, Shield, Stethoscope, type LucideIcon } from "lucide-react";
import { UserNavCard } from "@/components/auth/UserNavCard";
import {
  ADMIN_SYSTEMS,
  type AdminSystemId,
} from "@/lib/admin-systems";
import { getSession } from "@/lib/auth";

const SYSTEM_ICONS: Record<AdminSystemId, LucideIcon> = {
  medical: Stethoscope,
  general: Shield,
  aviation: Plane,
};

export default async function ApplicationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const availableSystems = session.allowedSystems
    .map((id) => ADMIN_SYSTEMS[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-amanaha.png"
              alt="Promed Web Experience"
              width={180}
              height={54}
              className="h-10 w-auto sm:h-12"
              priority
            />
            <div>
              <p className="text-[11px] font-medium text-maroon">
                Promed Web Experience
              </p>
              <p className="text-[11px] font-normal text-slate-500">
                Signed in as {session.name}
              </p>
            </div>
          </div>
          <UserNavCard
            name={session.name}
            email={session.email}
            layout="compact"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-[11px] font-medium text-slate-800">
            Choose an application
          </h1>
          <p className="mt-1 text-[11px] font-normal text-slate-500">
            Only systems assigned to your account are shown.
          </p>
        </div>

        {availableSystems.length === 0 ? (
          <div className="border border-slate-200 bg-white p-5 text-[11px] text-slate-500">
            Your account does not have access to any applications. Contact an
            administrator.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableSystems.map((system) => {
              const Icon = SYSTEM_ICONS[system.id];
              return (
                <Link
                  key={system.id}
                  href={system.basePath}
                  className="block border border-maroon/20 bg-white p-5 transition hover:border-maroon/40"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-maroon">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-[11px] font-medium text-slate-800">
                    {system.label}
                  </h2>
                  <p className="mt-2 text-[11px] font-normal leading-relaxed text-slate-500">
                    {system.description}
                  </p>
                  <p className="mt-4 text-[11px] font-medium text-maroon">
                    Open application →
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
