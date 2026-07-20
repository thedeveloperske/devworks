import { NextResponse } from "next/server";
import {
  buildCorporateData,
  buildCategoryGroupsData,
  buildContactPersonsData,
  buildCoverDateData,
  buildProviderRestrictionsData,
  buildPremiumRatesData,
  corpAnniversaryToFormValues,
  corpContactPersonToFormValues,
  corpGroupToFormValues,
  corpProviderToFormValues,
  clientRateToFormValues,
  hasCoverDateInput,
  syncCorpContactPersons,
  syncCorpGroups,
  syncCorpProviders,
  syncClientRates,
  upsertCorpAnniversary,
} from "@/features/medical/corporates";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const corporate = await prisma.corporate.findUnique({
    where: { id },
  });

  if (!corporate) {
    return NextResponse.json({ error: "Corporate not found" }, { status: 404 });
  }

  const coverAnniversary = await prisma.corpAnniversary.findFirst({
    where: { corpId: corporate.corpId },
    orderBy: [{ anniv: "desc" }, { idx: "desc" }],
  });

  const currentAnniv = coverAnniversary?.anniv ?? null;

  const contactPersons = await prisma.corpContactPerson.findMany({
    where: { corpId: corporate.corpId },
    orderBy: { idx: "asc" },
  });

  const categoryGroups = await prisma.corpGroup.findMany({
    where: {
      corpId: corporate.corpId,
      ...(currentAnniv != null ? { anniv: currentAnniv } : {}),
    },
    orderBy: { idx: "asc" },
  });

  const providerRestrictions = await prisma.corpProvider.findMany({
    where: {
      corpId: corporate.corpId,
      ...(currentAnniv != null ? { anniv: currentAnniv } : {}),
    },
    orderBy: { idx: "asc" },
  });

  const premiumRates = await prisma.clientRate.findMany({
    where: { corpId: corporate.corpId },
    orderBy: { idx: "asc" },
  });

  return NextResponse.json({
    ...corporate,
    coverAnniversary: coverAnniversary
      ? corpAnniversaryToFormValues(coverAnniversary)
      : null,
    contactPersons: contactPersons.map(corpContactPersonToFormValues),
    categoryGroups: categoryGroups.map(corpGroupToFormValues),
    providerRestrictions: providerRestrictions.map(corpProviderToFormValues),
    premiumRates: premiumRates.map(clientRateToFormValues),
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const result = buildCorporateData(body);

    if ("error" in result) {
      return result.error;
    }

    const corporate = await prisma.$transaction(async (tx) => {
      const updated = await tx.corporate.update({
        where: { id },
        data: result.data,
      });

      if (hasCoverDateInput(body.coverDates)) {
        const coverDateResult = buildCoverDateData(body.coverDates, {
          corpId: updated.corpId,
          agentId: result.data.agentId ?? updated.agentId,
          channel: result.data.channel ?? updated.channel,
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
          corpId: updated.corpId,
        });

        if ("error" in contactPersonsResult) {
          throw contactPersonsResult.error;
        }

        await syncCorpContactPersons(tx, updated.corpId, contactPersonsResult.data);
      }

      if (Array.isArray(body.categoryGroups)) {
        const categoryGroupsResult = buildCategoryGroupsData(
          body.categoryGroups,
          { corpId: updated.corpId },
          body.coverDates?.anniv
        );

        if ("error" in categoryGroupsResult) {
          throw categoryGroupsResult.error;
        }

        await syncCorpGroups(tx, updated.corpId, categoryGroupsResult.data);
      }

      if (Array.isArray(body.providerRestrictions)) {
        const providerRestrictionsResult = buildProviderRestrictionsData(
          body.providerRestrictions,
          { corpId: updated.corpId },
          body.coverDates?.anniv
        );

        if ("error" in providerRestrictionsResult) {
          throw providerRestrictionsResult.error;
        }

        await syncCorpProviders(
          tx,
          updated.corpId,
          providerRestrictionsResult.data
        );
      }

      if (Array.isArray(body.premiumRates)) {
        const premiumRatesResult = buildPremiumRatesData(body.premiumRates, {
          corpId: updated.corpId,
        });

        if ("error" in premiumRatesResult) {
          throw premiumRatesResult.error;
        }

        await syncClientRates(tx, updated.corpId, premiumRatesResult.data);
      }

      return updated;
    });

    return NextResponse.json(corporate);
  } catch (error: unknown) {
    if (error instanceof NextResponse) {
      return error;
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Corporate not found" }, { status: 404 });
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
      { error: "Failed to update corporate" },
      { status: 500 }
    );
  }
}
