"use client";

import Link from "next/link";
import {
  Ban,
  Building2,
  ClipboardList,
  Gauge,
  List,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
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
      <p className="text-[12px] font-semibold text-slate-900">{item.label}</p>
      <p className="mt-1 text-[12px] text-slate-500">{item.description}</p>
    </Link>
  );
}

export function MemberReportsPageClient() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Reports"
        description="Member management reports"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reportItems.map((item) => (
          <ReportCard key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}
