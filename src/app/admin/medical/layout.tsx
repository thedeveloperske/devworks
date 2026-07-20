import { AdminPanelShell } from "@/components/admin/AdminPanelShell";

export const dynamic = "force-dynamic";

export default function MedicalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminPanelShell system="medical">{children}</AdminPanelShell>;
}
