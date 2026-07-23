"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import {
  ADMIN_SYSTEMS,
  type AdminSystemId,
} from "@/lib/admin-systems";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  Percent,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

type NavChild = {
  href: string;
  label: string;
  match?: (pathname: string, searchParams: URLSearchParams) => boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof Building2;
  exact?: boolean;
  children?: NavChild[];
};

function getMedicalNavItems(base: string): NavItem[] {
  const corporates = `${base}/corporates`;
  const agents = `${base}/agents`;
  const selectionItems = `${base}/selection-items`;
  const members = `${base}/members`;
  const claims = `${base}/claims`;
  const premiums = `${base}/premiums`;
  const commissions = `${base}/commissions`;
  const care = `${base}/care`;
  const reInsurance = `${base}/re-insurance`;
  const admin = `${base}/admin`;

  return [
    { href: base, label: "Dashboard", icon: LayoutDashboard, exact: true },
    {
      href: corporates,
      label: "Corporates",
      icon: Building2,
      children: [
        {
          href: `${corporates}?manage=1`,
          label: "Corporate Management",
          match: (pathname, searchParams) => {
            const manage = searchParams.get("manage") === "1";
            if (!manage) return false;

            return (
              pathname === corporates ||
              (pathname.startsWith(`${corporates}/`) &&
                !pathname.startsWith(`${corporates}/renew`))
            );
          },
        },
        {
          href: `${corporates}/renew`,
          label: "Renew Corporate",
          match: (pathname) => pathname.startsWith(`${corporates}/renew`),
        },
      ],
    },
    {
      href: `${members}?manage=1`,
      label: "Members",
      icon: Users,
      children: [
        {
          href: `${members}?manage=1`,
          label: "Manage Members",
          match: (pathname, searchParams) => {
            if (searchParams.get("status") === "1") return false;
            if (searchParams.get("manage") !== "1") return false;
            if (pathname !== members) return false;
            return true;
          },
        },
        {
          href: `${members}/status`,
          label: "Member Cancellation & Reinstate",
          match: (pathname, searchParams) =>
            pathname.startsWith(`${members}/status`) ||
            (pathname === members && searchParams.get("status") === "1"),
        },
        {
          href: `${members}/renew`,
          label: "Renew Members",
          match: (pathname) => pathname.startsWith(`${members}/renew`),
        },
        {
          href: `${members}/upload`,
          label: "Upload Members",
          match: (pathname) => pathname.startsWith(`${members}/upload`),
        },
        {
          href: `${members}/reports`,
          label: "Reports",
          match: (pathname) => pathname.startsWith(`${members}/reports`),
        },
      ],
    },
    {
      href: claims,
      label: "Claims",
      icon: ClipboardList,
      children: [
        {
          href: `${claims}/batching`,
          label: "Batching",
          match: (pathname) => pathname.startsWith(`${claims}/batching`),
        },
        {
          href: `${claims}/manage`,
          label: "Manage Claims",
          match: (pathname) => pathname.startsWith(`${claims}/manage`),
        },
        {
          href: `${claims}/pay`,
          label: "Pay Claims",
          match: (pathname) => pathname.startsWith(`${claims}/pay`),
        },
        {
          href: `${claims}/reports`,
          label: "Reports",
          match: (pathname) => pathname.startsWith(`${claims}/reports`),
        },
      ],
    },
    {
      href: premiums,
      label: "Premiums",
      icon: Wallet,
      children: [
        {
          href: `${premiums}/debits`,
          label: "Premium Debits",
          match: (pathname) => pathname.startsWith(`${premiums}/debits`),
        },
        {
          href: `${premiums}/receipts`,
          label: "Premium Receipts",
          match: (pathname) => pathname.startsWith(`${premiums}/receipts`),
        },
        {
          href: `${premiums}/fund-invoices`,
          label: "Fund Invoices & Top up",
          match: (pathname) => pathname.startsWith(`${premiums}/fund-invoices`),
        },
        {
          href: `${premiums}/fund-receipts`,
          label: "Fund Receipts",
          match: (pathname) => pathname.startsWith(`${premiums}/fund-receipts`),
        },
        {
          href: `${premiums}/reports`,
          label: "Reports",
          match: (pathname) => pathname.startsWith(`${premiums}/reports`),
        },
      ],
    },
    {
      href: commissions,
      label: "Commissions",
      icon: Percent,
      children: [
        {
          href: `${commissions}/pay`,
          label: "Pay Commission",
          match: (pathname) => pathname.startsWith(`${commissions}/pay`),
        },
        {
          href: `${commissions}/statements`,
          label: "Commission Statements",
          match: (pathname) => pathname.startsWith(`${commissions}/statements`),
        },
      ],
    },
    {
      href: care,
      label: "Care",
      icon: HeartPulse,
      children: [
        {
          href: `${care}/pre-authorization`,
          label: "Pre-authorization",
          match: (pathname) =>
            pathname.startsWith(`${care}/pre-authorization`),
        },
        {
          href: `${care}/admission`,
          label: "Care Admission",
          match: (pathname) => pathname.startsWith(`${care}/admission`),
        },
        {
          href: `${care}/visits`,
          label: "Care Visits",
          match: (pathname) => pathname.startsWith(`${care}/visits`),
        },
        {
          href: `${care}/reports`,
          label: "Reports",
          match: (pathname) => pathname.startsWith(`${care}/reports`),
        },
      ],
    },
    {
      href: reInsurance,
      label: "Re-Insurance",
      icon: Shield,
      children: [
        {
          href: `${reInsurance}/premium-schedule`,
          label: "Premium Schedule",
          match: (pathname) =>
            pathname.startsWith(`${reInsurance}/premium-schedule`),
        },
        {
          href: `${reInsurance}/claims-schedule`,
          label: "Claims Schedule",
          match: (pathname) =>
            pathname.startsWith(`${reInsurance}/claims-schedule`),
        },
      ],
    },
    {
      href: admin,
      label: "Admin",
      icon: Settings,
      children: [
        {
          href: `${agents}?manage=1`,
          label: "Agent Management",
          match: (pathname, searchParams) => {
            if (searchParams.get("manage") !== "1") return false;
            return pathname === agents || pathname.startsWith(`${agents}/`);
          },
        },
        {
          href: selectionItems,
          label: "Selection Items",
          match: (pathname) =>
            pathname === selectionItems || pathname.startsWith(`${selectionItems}/`),
        },
        {
          href: `${admin}/providers`,
          label: "Provider List",
          match: (pathname) => pathname.startsWith(`${admin}/providers`),
        },
        {
          href: `${admin}/update-family-size`,
          label: "Update Family Size",
          match: (pathname) => pathname.startsWith(`${admin}/update-family-size`),
        },
        {
          href: `${admin}/users`,
          label: "User Management",
          match: (pathname) => pathname.startsWith(`${admin}/users`),
        },
        {
          href: `${admin}/user-activity`,
          label: "User Activity",
          match: (pathname) => pathname.startsWith(`${admin}/user-activity`),
        },
        {
          href: `${admin}/change-password`,
          label: "Change Password",
          match: (pathname) => pathname.startsWith(`${admin}/change-password`),
        },
        {
          href: `${admin}/delete-entry`,
          label: "Delete Entry",
          match: (pathname) => pathname.startsWith(`${admin}/delete-entry`),
        },
        {
          href: `${admin}/wrong-diagnosis`,
          label: "Wrong Diagnosis",
          match: (pathname) => pathname.startsWith(`${admin}/wrong-diagnosis`),
        },
        {
          href: `${admin}/unrenew-members`,
          label: "Unrenew Members",
          match: (pathname) => pathname.startsWith(`${admin}/unrenew-members`),
        },
        {
          href: `${admin}/unvet-claims`,
          label: "Unvet Claims",
          match: (pathname) => pathname.startsWith(`${admin}/unvet-claims`),
        },
      ],
    },
  ];
}

function getNavItems(base: string): NavItem[] {
  return getMedicalNavItems(base);
}

function AdminBrand({ homeHref }: { homeHref: string }) {
  return (
    <Link href={homeHref} className="flex min-w-0 items-center gap-3">
      <Image
        src="/logo-amanaha.png"
        alt="Amanah Insurance"
        width={180}
        height={54}
        className="h-12 w-auto shrink-0 sm:h-14"
        priority
      />
      <span className="max-w-36 text-left text-[8px] font-medium leading-snug tracking-wide text-slate-500 sm:max-w-none sm:text-[9px]">
        Medical Insurance Experience
      </span>
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: typeof Building2;
  exact?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded px-2.5 py-2 text-[12px] font-semibold transition ${
        active
          ? "bg-maroon/10 text-maroon"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      <span>{label}</span>
    </Link>
  );
}

function NavGroup({
  item,
  openGroupHref,
  setOpenGroupHref,
  onNavigate,
}: {
  item: NavItem;
  openGroupHref: string | null;
  setOpenGroupHref: (href: string | null) => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groupActive =
    pathname.startsWith(item.href) ||
    (item.children?.some((child) => {
      const childPath = child.href.split("?")[0];
      return pathname === childPath || pathname.startsWith(`${childPath}/`);
    }) ??
      false);
  const hasChildren = (item.children?.length ?? 0) > 0;
  const open = hasChildren && openGroupHref === item.href;

  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (!hasChildren) return;
          setOpenGroupHref(open ? null : item.href);
        }}
        className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[12px] font-semibold transition ${
          groupActive
            ? "bg-maroon/10 text-maroon"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0 flex-1">{item.label}</span>
        {hasChildren ? (
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`}
          />
        ) : null}
      </button>
      {open && hasChildren ? (
        <div className="mt-0.5 space-y-0.5 border-l border-slate-200 py-0.5 pl-3 ml-3.5">
          {item.children!.map((child) => {
            const active = child.match
              ? child.match(pathname, searchParams)
              : pathname === child.href || pathname.startsWith(`${child.href}/`);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => {
                  onNavigate?.();
                }}
                className={`block rounded px-2.5 py-1.5 text-[12px] font-medium transition ${
                  active
                    ? "bg-maroon/10 text-maroon"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function renderNavItem(
  item: NavItem,
  openGroupHref: string | null,
  setOpenGroupHref: (href: string | null) => void,
  onNavigate?: () => void
) {
  if (item.children) {
    return (
      <NavGroup
        key={item.href}
        item={item}
        openGroupHref={openGroupHref}
        setOpenGroupHref={setOpenGroupHref}
        onNavigate={onNavigate}
      />
    );
  }
  return <NavLink key={item.href} {...item} onNavigate={onNavigate} />;
}

export function AdminPanelShell({
  children,
  system = "medical",
}: {
  children: React.ReactNode;
  system?: AdminSystemId;
}) {
  const pathname = usePathname();
  const basePath = ADMIN_SYSTEMS[system].basePath;
  const navItems = getNavItems(basePath);
  const [openGroupHref, setOpenGroupHref] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const activeGroup =
      navItems.find(
        (item) =>
          item.children &&
          (pathname.startsWith(item.href) ||
            item.children.some((child) => {
              const childPath = child.href.split("?")[0];
              return pathname === childPath || pathname.startsWith(`${childPath}/`);
            }))
      )?.href ?? null;
    setOpenGroupHref(activeGroup);
  }, [pathname, basePath]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const navContent = (
    <nav className="flex flex-col gap-0.5 p-3">
      {navItems.map((item) =>
        renderNavItem(item, openGroupHref, setOpenGroupHref, () =>
          setMobileNavOpen(false)
        )
      )}
    </nav>
  );

  return (
    <div data-admin className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="sticky top-0 z-100 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <ChevronDown
                className={`h-4 w-4 transition ${mobileNavOpen ? "rotate-180" : "-rotate-90"}`}
              />
            </button>
            <AdminBrand homeHref={basePath} />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/applications"
              className="text-[12px] font-semibold text-slate-600 hover:text-maroon"
            >
              Applications
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-[4.25rem] max-h-[calc(100dvh-4.25rem)] overflow-y-auto">
            {navContent}
          </div>
        </aside>

        {mobileNavOpen ? (
          <>
            <button
              type="button"
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="fixed bottom-0 left-0 top-[3.75rem] z-50 w-64 overflow-y-auto border-r border-slate-200 bg-white shadow-lg lg:hidden">
              {navContent}
            </aside>
          </>
        ) : null}

        <main className="relative min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
