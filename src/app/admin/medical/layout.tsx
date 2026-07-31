import { AdminPanelShell } from "@/components/admin/AdminPanelShell";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MedicalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <AdminPanelShell
      system="medical"
      userName={session.name}
      userEmail={session.email}
    >
      {children}
    </AdminPanelShell>
  );
}
