import { NextResponse } from "next/server";
import {
  buildCategoryGroupsData,
  buildCoverDateData,
  buildProviderRestrictionsData,
} from "@/features/medical/corporates";
import { prisma } from "@/lib/prisma";

function trimOrNull(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const corporateId = trimOrNull(body.corporateId);

    if (!corporateId) {
      return NextResponse.json({ error: "Corporate is required" }, { status: 400 });
    }

    const corporate = await prisma.corporate.findUnique({
      where: { id: corporateId },
      select: {
        corpId: true,
        agentId: true,
        channel: true,
      },
    });

    if (!corporate?.corpId) {
      return NextResponse.json({ error: "Corporate not found" }, { status: 404 });
    }

    const latest = await prisma.corpAnniversary.aggregate({
      where: { corpId: corporate.corpId },
      _max: { anniv: true },
    });
    const nextAnniv = (latest._max.anniv ?? 0) + 1;

    const coverDateResult = buildCoverDateData(
      {
        startDate: body.periodStart,
        endDate: body.periodEnd,
        renewalDate: body.renewalDate,
        anniv: String(nextAnniv),
      },
      {
        ...corporate,
        agentId: trimOrNull(body.agentId) ?? corporate.agentId,
      }
    );

    if ("error" in coverDateResult) {
      return coverDateResult.error;
    }

    if (!coverDateResult.data) {
      return NextResponse.json(
        { error: "Start date, end date, and renewal date are required" },
        { status: 400 }
      );
    }

    const categoryGroupsResult = buildCategoryGroupsData(
      body.categoryGroups,
      { corpId: corporate.corpId },
      String(nextAnniv)
    );
    if ("error" in categoryGroupsResult) {
      return categoryGroupsResult.error;
    }

    const providerRestrictionsResult = buildProviderRestrictionsData(
      body.providerRestrictions,
      { corpId: corporate.corpId },
      String(nextAnniv)
    );
    if ("error" in providerRestrictionsResult) {
      return providerRestrictionsResult.error;
    }

    const renewal = await prisma.$transaction(async (tx) => {
      const created = await tx.corpAnniversary.create({
        data: {
          ...coverDateResult.data!,
          anniv: nextAnniv,
          dateEntered: new Date(),
        },
      });

      for (const row of categoryGroupsResult.data) {
        const { idx: _idx, ...data } = row;
        await tx.corpGroup.create({
          data: {
            ...data,
            anniv: nextAnniv,
          },
        });
      }

      for (const row of providerRestrictionsResult.data) {
        const { idx: _idx, ...data } = row;
        await tx.corpProvider.create({
          data: {
            ...data,
            anniv: nextAnniv,
          },
        });
      }

      return created;
    });

    return NextResponse.json(renewal, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json({ error: "Corporate not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to renew corporate" },
      { status: 500 }
    );
  }
}
