"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import {
  Ban,
  Building2,
  ClipboardList,
  Gauge,
  List,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { PageHeader } from "@/components/admin/PageHeader";

type MemberReportItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const reportItems: MemberReportItem[] = [
  {
    href: "/admin/medical/members/reports/membership-list",
    label: "Membership List",
    description: "Full list of members across schemes",
    icon: List,
  },
  {
    href: "/admin/medical/members/reports/corporate-population",
    label: "Corporate Population",
    description: "Member counts by corporate",
    icon: Building2,
  },
  {
    href: "/admin/medical/members/reports/active-members",
    label: "Active Members",
    description: "Members currently on cover",
    icon: UserCheck,
  },
  {
    href: "/admin/medical/members/reports/cancelled-members",
    label: "Cancelled Members",
    description: "Members with cancelled cover",
    icon: Ban,
  },
  {
    href: "/admin/medical/members/reports/category-wise",
    label: "Category Wise",
    description: "Members grouped by category",
    icon: ClipboardList,
  },
  {
    href: "/admin/medical/members/reports/members-with-limits",
    label: "Members with Limits",
    description: "Members with benefit limits applied",
    icon: Gauge,
  },
];

function ReportCard({ item }: { item: MemberReportItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="block border border-slate-200 bg-white p-4 transition-colors hover:border-maroon/30"
    >
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-maroon">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-semibold text-slate-900">{item.label}</p>
      <p className="mt-1 text-[11px] text-slate-500">{item.description}</p>
    </Link>
  );
}

export function MemberReportsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const manageOpen = searchParams.get("manage") === "1";

  const closeManageModal = useCallback(() => {
    router.push("/admin/medical");
  }, [router]);

  useEffect(() => {
    if (searchParams.get("manage") === "1") return;
    router.replace(`${pathname}?manage=1`, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <div className={`relative ${manageOpen ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
      <div className={manageOpen ? "pointer-events-none opacity-40" : undefined}>
        <PageHeader
          title="Reports"
          description="Open Reports from Members to view member management reports"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Member Reports"
        description="Select a report to open"
      >
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reportItems.map((item) => (
              <ReportCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
