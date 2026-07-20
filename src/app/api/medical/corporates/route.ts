import { NextResponse } from "next/server";
import {
  buildCorporateData,
  buildCategoryGroupsData,
  buildContactPersonsData,
  buildCoverDateData,
  buildProviderRestrictionsData,
  buildPremiumRatesData,
  buildPolicyNo,
  hasCoverDateInput,
  syncCorpContactPersons,
  syncCorpGroups,
  syncCorpProviders,
  syncClientRates,
  upsertCorpAnniversary,
} from "@/features/medical/corporates";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [corporates, applicantCounts] = await Promise.all([
    prisma.corporate.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.principalApplicant.groupBy({
      by: ["corpId"],
      _count: {
        memberNo: true,
      },
    }),
  ]);

  const countMap = new Map(
    applicantCounts
      .filter((group) => group.corpId !== null)
      .map((group) => [group.corpId!, group._count.memberNo])
  );

  const result = corporates.map((corporate) => ({
    ...corporate,
    _count: {
      members: countMap.get(corporate.corpId) ?? 0,
    },
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildCorporateData(body);

    if ("error" in result) {
      return result.error;
    }

    const corporate = await prisma.$transaction(async (tx) => {
      const created = await tx.corporate.create({
        data: result.data,
      });

      const withPolicyNo = await tx.corporate.update({
        where: { id: created.id },
        data: { policyNo: buildPolicyNo(created.corpId) },
      });

      if (hasCoverDateInput(body.coverDates)) {
        const coverDateResult = buildCoverDateData(body.coverDates, {
          corpId: withPolicyNo.corpId,
          agentId: result.data.agentId ?? withPolicyNo.agentId,
          channel: result.data.channel ?? withPolicyNo.channel,
        });

        if ("error" in coverDateResult) {
          throw coverDateResult.error;
        }

        if (coverDateResult.data) {
          await upsertCorpAnniversary(tx, coverDateResult.data);
        }
      }

      if (Array.isArray(body.contactPersons)) {
        const contactPersonsResult = buildContactPersonsData(body.contactPersons, {
          corpId: withPolicyNo.corpId,
        });

        if ("error" in contactPersonsResult) {
          throw contactPersonsResult.error;
        }

        await syncCorpContactPersons(
          tx,
          withPolicyNo.corpId,
          contactPersonsResult.data
        );
      }

      if (Array.isArray(body.categoryGroups)) {
        const categoryGroupsResult = buildCategoryGroupsData(
          body.categoryGroups,
          { corpId: withPolicyNo.corpId },
          body.coverDates?.anniv
        );

        if ("error" in categoryGroupsResult) {
          throw categoryGroupsResult.error;
        }

        await syncCorpGroups(tx, withPolicyNo.corpId, categoryGroupsResult.data);
      }

      if (Array.isArray(body.providerRestrictions)) {
        const providerRestrictionsResult = buildProviderRestrictionsData(
          body.providerRestrictions,
          { corpId: withPolicyNo.corpId },
          body.coverDates?.anniv
        );

        if ("error" in providerRestrictionsResult) {
          throw providerRestrictionsResult.error;
        }

        await syncCorpProviders(
          tx,
          withPolicyNo.corpId,
          providerRestrictionsResult.data
        );
      }

      if (Array.isArray(body.premiumRates)) {
        const premiumRatesResult = buildPremiumRatesData(body.premiumRates, {
          corpId: withPolicyNo.corpId,
        });

        if ("error" in premiumRatesResult) {
          throw premiumRatesResult.error;
        }

        await syncClientRates(tx, withPolicyNo.corpId, premiumRatesResult.data);
      }

      return withPolicyNo;
    });

    return NextResponse.json(corporate, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A corporate with this corp ID already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create corporate" },
      { status: 500 }
    );
  }
}
