"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
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
import { Modal } from "@/components/admin/Modal";
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
      <div className="mb-3 border-b border-slate-200 pb-2">
        <h2 className="text-[12px] font-bold uppercase tracking-wide text-maroon">
          {title}
        </h2>
        <p className="mt-1 text-[12px] text-slate-500">{description}</p>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <SelectionItemCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

export function SelectionItemsPageClient() {
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
          title="Selection Items"
          description="Open Selection Items from Admin to configure lookup values"
        />
      </div>

      <Modal
        open={manageOpen}
        onClose={closeManageModal}
        title="Selection Items"
        description="Configure lookup values used across the entire system"
      >
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <div className="grid gap-6 lg:grid-cols-3">
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
      </Modal>
    </div>
  );
}
