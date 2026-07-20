import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  corpAnniversaryToRenewalListItem,
  isCorpAnniversaryActive,
} from "@/features/medical/corporates";
import { MemberPopulationPieChart } from "@/features/medical/dashboard/components/MemberPopulationPieChart";
import { MemberStatusLineChart } from "@/features/medical/dashboard/components/MemberStatusLineChart";
import { buildMemberStatusSeries } from "@/features/medical/dashboard/member-status-series";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

/** Business class lookup: 1 = CORPORATE, 2 = INDIVIDUAL. */
const BUSINESS_CLASS_INDIVIDUAL = "2";

export default async function MedicalDashboardPage() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setUTCDate(soon.getUTCDate() + 30);
  const seriesStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1)
  );

  const [
    corporateCount,
    activePeriods,
    expiringSoon,
    cancelledCount,
    recentCorporates,
    recentRenewals,
    corporatesForMembers,
    activeMemberCount,
    cancelledMemberCount,
    cancellationEvents,
  ] = await Promise.all([
    prisma.corporate.count({ where: { cancelled: false } }),
    prisma.corpAnniversary.count({
      where: { endDate: { gte: today } },
    }),
    prisma.corpAnniversary.count({
      where: {
        endDate: { gte: today, lte: soon },
      },
    }),
    prisma.corporate.count({ where: { cancelled: true } }),
    prisma.corporate.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        corporate: true,
        corpId: true,
        policyNo: true,
        cancelled: true,
      },
    }),
    prisma.corpAnniversary.findMany({
      take: 5,
      orderBy: { idx: "desc" },
      include: {
        corporate: {
          select: { corporate: true, corpId: true, policyNo: true },
        },
      },
    }),
    prisma.corporate.findMany({
      select: { corpId: true, businessClass: true },
    }),
    // Active: cancelled is null or anything other than 1.
    prisma.memberInfo.count({
      where: { OR: [{ cancelled: null }, { cancelled: { not: 1 } }] },
    }),
    prisma.memberInfo.count({
      where: { cancelled: 1 },
    }),
    prisma.memberCancellation.findMany({
      where: { dateCan: { gte: seriesStart } },
      select: { cancelled: true, dateCan: true },
      orderBy: { dateCan: "asc" },
    }),
  ]);

  const individualCorpIds = corporatesForMembers
    .filter((corporate) => corporate.businessClass === BUSINESS_CLASS_INDIVIDUAL)
    .map((corporate) => corporate.corpId);
  const corporateCorpIds = corporatesForMembers
    .filter((corporate) => corporate.businessClass !== BUSINESS_CLASS_INDIVIDUAL)
    .map((corporate) => corporate.corpId);

  const [individualMemberCount, corporateMemberCount] = await Promise.all([
    individualCorpIds.length > 0
      ? prisma.memberInfo.count({
          where: { corpId: { in: individualCorpIds } },
        })
      : Promise.resolve(0),
    corporateCorpIds.length > 0
      ? prisma.memberInfo.count({
          where: { corpId: { in: corporateCorpIds } },
        })
      : Promise.resolve(0),
  ]);

  const memberStatusPoints = buildMemberStatusSeries({
    activeCount: activeMemberCount,
    cancelledCount: cancelledMemberCount,
    events: cancellationEvents,
    monthCount: 12,
    asOf: today,
  });

  const stats = [
    {
      label: "Corporates",
      value: corporateCount,
      href: "/admin/medical/corporates?manage=1",
    },
    {
      label: "Active Cover Periods",
      value: activePeriods,
      href: "/admin/medical/corporates/renew",
    },
    {
      label: "Expiring in 30 Days",
      value: expiringSoon,
      href: "/admin/medical/corporates/renew",
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      href: "/admin/medical/corporates?manage=1",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of corporate accounts and cover periods"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-slate-200 bg-white p-5 transition-colors hover:border-maroon/30"
          >
            <p className="text-[12px] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-[12px] font-bold text-maroon">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <MemberPopulationPieChart
          individualCount={individualMemberCount}
          corporateCount={corporateMemberCount}
        />
        <MemberStatusLineChart points={memberStatusPoints} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-[12px] font-semibold text-slate-900">
              Recent Corporates
            </h2>
            <Link
              href="/admin/medical/corporates?manage=1"
              className="text-[12px] font-semibold text-maroon hover:underline"
            >
              View all
            </Link>
          </div>
          {recentCorporates.length === 0 ? (
            <p className="px-6 py-8 text-[12px] text-slate-500">
              No corporates yet.{" "}
              <Link
                href="/admin/medical/corporates?manage=1&new=1"
                className="text-maroon hover:underline"
              >
                Add your first corporate
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentCorporates.map((corporate) => (
                <Link
                  key={corporate.id}
                  href={`/admin/medical/corporates?manage=1&edit=${corporate.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-slate-900">
                      {corporate.corporate}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {corporate.corpId ?? "—"} · {corporate.policyNo ?? "—"}
                    </p>
                  </div>
                  <StatusBadge
                    status={corporate.cancelled ? "CANCELLED" : "ACTIVE"}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-[12px] font-semibold text-slate-900">
              Recent Renewals
            </h2>
            <Link
              href="/admin/medical/corporates/renew"
              className="text-[12px] font-semibold text-maroon hover:underline"
            >
              View all
            </Link>
          </div>
          {recentRenewals.length === 0 ? (
            <p className="px-6 py-8 text-[12px] text-slate-500">
              No cover periods yet.{" "}
              <Link
                href="/admin/medical/corporates/renew"
                className="text-maroon hover:underline"
              >
                Renew a corporate
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentRenewals.map((anniversary) => {
                const renewal = corpAnniversaryToRenewalListItem(anniversary);

                return (
                  <div
                    key={renewal.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="text-[12px] font-semibold text-slate-900">
                        {renewal.corporate}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        Anniv {renewal.anniv} · {formatDate(renewal.periodStart)}{" "}
                        – {formatDate(renewal.periodEnd)}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        isCorpAnniversaryActive(anniversary.endDate)
                          ? "ACTIVE"
                          : "INACTIVE"
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
