import Link from "next/link";
import {
  Ban,
  BedDouble,
  Building2,
  ClipboardList,
  FileWarning,
  HeartPulse,
  Landmark,
  MinusCircle,
  Percent,
  Receipt,
  Shield,
  Stethoscope,
  UserRound,
  Users,
  Wallet,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";

type SelectionItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const underwritingItems: SelectionItem[] = [
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

const claimsItems: SelectionItem[] = [
  {
    href: "/admin/medical/selection-items/service",
    label: "Service",
    description: "Manage claim services",
    icon: Receipt,
  },
  {
    href: "/admin/medical/selection-items/diagnosis",
    label: "Diagnosis",
    description: "Manage diagnoses",
    icon: Stethoscope,
  },
  {
    href: "/admin/medical/selection-items/doctor",
    label: "Doctor",
    description: "Manage doctors",
    icon: UserRound,
  },
  {
    href: "/admin/medical/selection-items/exgratia-reasons",
    label: "Exgratia Reasons",
    description: "Manage exgratia reasons",
    icon: FileWarning,
  },
  {
    href: "/admin/medical/selection-items/deduction-reason",
    label: "Deduction Reason",
    description: "Manage deduction reasons",
    icon: MinusCircle,
  },
  {
    href: "/admin/medical/selection-items/rejection-reason",
    label: "Rejection Reason",
    description: "Manage rejection reasons",
    icon: XCircle,
  },
  {
    href: "/admin/medical/selection-items/invalid-bill-reason",
    label: "Invalid Bill Reason",
    description: "Manage invalid bill reasons",
    icon: Ban,
  },
];

const careItems: SelectionItem[] = [
  {
    href: "/admin/medical/selection-items/hospital-ward?manage=1",
    label: "Hospital Ward",
    description: "Manage hospital wards",
    icon: BedDouble,
  },
  {
    href: "/admin/medical/selection-items/decline-reason",
    label: "Decline Reason",
    description: "Manage decline reasons",
    icon: Ban,
  },
];

function SelectionItemCard({ item }: { item: SelectionItem }) {
  const Icon = item.icon;
  return (
    <Link
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
}

function SelectionGroup({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: SelectionItem[];
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-maroon">
          {title}
        </h2>
        <p className="mt-1 text-[12px] text-slate-500">{description}</p>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <SelectionItemCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function SelectionItemsPage() {
  return (
    <div>
      <PageHeader
        title="Selection Items"
        description="Configure lookup values used across the entire system"
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <SelectionGroup
          title="Underwriting"
          description="Lookup values used in underwriting and corporate setup"
          items={underwritingItems}
        />
        <SelectionGroup
          title="Claims"
          description="Lookup values used in claims processing"
          items={claimsItems}
        />
        <SelectionGroup
          title="Care"
          description="Lookup values used in care management"
          items={careItems}
        />
      </div>
    </div>
  );
}
