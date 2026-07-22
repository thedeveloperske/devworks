import { PageHeader } from "@/components/admin/PageHeader";
import { ADMIN_SYSTEMS } from "@/lib/admin-systems";

export default function GeneralAdminHomePage() {
  const system = ADMIN_SYSTEMS.general;

  return (
    <div>
      <PageHeader
        title={system.label}
        description="This application workspace is ready. Modules will be added here."
      />
    </div>
  );
}
