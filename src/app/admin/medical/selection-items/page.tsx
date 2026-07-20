import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";

const items = [
  {
    href: "/admin/medical/selection-items/benefits?manage=1",
    label: "Benefit Management",
    description: "Manage Benefits",
  },
  {
    href: "/admin/medical/selection-items/categories?manage=1",
    label: "Category Management",
    description: "Manage Categories",
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
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-slate-200 bg-white p-5 transition-colors hover:border-maroon/30"
          >
            <p className="text-[12px] font-semibold text-slate-900">{item.label}</p>
            <p className="mt-2 text-[12px] text-slate-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
