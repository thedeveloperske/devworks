import { PageHeader } from "@/components/admin/PageHeader";
import { ADMIN_SYSTEMS } from "@/lib/admin-systems";

export default function AviationAdminHomePage() {
  const system = ADMIN_SYSTEMS.aviation;

  return (
    <div>
      <PageHeader
        title={system.label}
        description="This application workspace is ready. Modules will be added here."
      />
    </div>
  );
}
