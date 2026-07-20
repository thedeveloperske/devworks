import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ADMIN_SYSTEMS } from "@/lib/admin-systems";
import { getSession } from "@/lib/auth";

export default async function ApplicationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const hasMedical = session.allowedSystems.includes("medical");
  const medical = ADMIN_SYSTEMS.medical;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-amanaha.png"
              alt="Amanah Insurance"
              width={180}
              height={54}
              className="h-10 w-auto sm:h-12"
              priority
            />
            <div>
              <p className="text-[12px] font-semibold text-maroon">Promed Applications</p>
              <p className="text-[12px] text-slate-500">Signed in as {session.name}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-[12px] font-bold text-slate-900">Choose an application</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            Select the insurance system you want to work in.
          </p>
        </div>

        {!hasMedical ? (
          <div className="border border-slate-200 bg-white p-6 text-[12px] text-slate-500">
            Your account does not have access to any applications. Contact an administrator.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={medical.basePath}
              className="block border border-maroon/20 bg-white p-5 transition hover:border-maroon/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-maroon">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h2 className="text-[12px] font-bold text-slate-900">{medical.label}</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                Corporate management and renewals for medical insurance.
              </p>
              <p className="mt-4 text-[12px] font-semibold text-maroon">Open application →</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
