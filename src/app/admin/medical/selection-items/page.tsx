import Link from "next/link";
import {
  Building2,
  ClipboardList,
  HeartPulse,
  Landmark,
  Percent,
  Shield,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

const items: Array<{
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    href: "/admin/medical/selection-items/benefits?manage=1",
    label: "Benefit Management",
    description: "Manage Benefits",
    icon: HeartPulse,
  },
  {
    href: "/admin/medical/selection-items/categories?manage=1",
    label: "Category Management",
    description: "Manage Categories",
    icon: ClipboardList,
  },
  {
    href: "/admin/medical/selection-items/banks",
    label: "Banks",
    description: "Manage banks",
    icon: Landmark,
  },
  {
    href: "/admin/medical/selection-items/levy",
    label: "Levy",
    description: "Manage levies",
    icon: Percent,
  },
  {
    href: "/admin/medical/selection-items/branch",
    label: "Branch",
    description: "Manage branches",
    icon: Building2,
  },
  {
    href: "/admin/medical/selection-items/card-rates",
    label: "Card Rates",
    description: "Manage card rates",
    icon: Wallet,
  },
  {
    href: "/admin/medical/selection-items/re-insurer",
    label: "Re-Insurer",
    description: "Manage re-insurers",
    icon: Shield,
  },
  {
    href: "/admin/medical/selection-items/unit-managers",
    label: "Unit Managers",
    description: "Manage unit managers",
    icon: Users,
  },
];

export default function SelectionItemsPage() {
  return (
    <div>
      <PageHeader
        title="Selection Items"
        description="Configure lookup values used across the entire system"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="border border-slate-200 bg-white p-5 transition-colors hover:border-maroon/30"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-maroon">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[12px] font-semibold text-slate-900">{item.label}</p>
              <p className="mt-2 text-[12px] text-slate-500">{item.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
