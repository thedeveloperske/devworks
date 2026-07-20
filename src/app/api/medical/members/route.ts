import { NextResponse } from "next/server";
import {
  allocateNextFamilyNo,
  buildMemberAcceptanceData,
  buildMemberAnniversariesData,
  buildMemberBenefitsData,
  buildMemberInfoData,
  buildMemberMedicalData,
  buildPrincipalApplicantData,
  syncMemberAnniversaries,
  syncMemberBenefits,
  upsertMemberAcceptance,
  upsertMemberInfo,
  upsertMemberMedical,
  upsertPrincipalApplicant,
} from "@/features/medical/members";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const principals = await prisma.principalApplicant.findMany({
    orderBy: [{ surname: "asc" }, { firstName: "asc" }],
  });
  return NextResponse.json(principals);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const corpId = body.principalInformation?.corpId;

    const clientFamilyNo = body.principalInformation?.familyNo?.trim();
    const clientMemberNo = body.principalInformation?.memberNo?.trim();

    let familyNo = clientFamilyNo || "";
    let memberNo = clientMemberNo || "";

    if (!familyNo || !memberNo) {
      const familyNoResult = await allocateNextFamilyNo(prisma, corpId);
      if ("error" in familyNoResult) {
        return familyNoResult.error;
      }
      familyNo = familyNoResult.familyNo;
      memberNo = familyNoResult.memberNo;
    }

    const principalResult = buildPrincipalApplicantData({
      ...body.principalInformation,
      familyNo,
      memberNo,
    });
    if ("error" in principalResult) {
      return principalResult.error;
    }

    const bioResult = buildMemberInfoData(
      {
        ...body.bioData,
        familyNo,
        memberNo,
      },
      memberNo,
      familyNo,
      principalResult.data?.corpId ?? undefined
    );
    if ("error" in bioResult) {
      return bioResult.error;
    }

    const medicalResult = buildMemberMedicalData(body.medicalDetails, memberNo);
    if ("error" in medicalResult) {
      return medicalResult.error;
    }

    const benefitsResult = buildMemberBenefitsData(
      body.benefits,
      memberNo,
      principalResult.data?.corpId ?? undefined
    );
    if ("error" in benefitsResult) {
      return benefitsResult.error;
    }

    const coverHistoryResult = buildMemberAnniversariesData(
      body.coverHistory,
      memberNo
    );
    if ("error" in coverHistoryResult) {
      return coverHistoryResult.error;
    }

    const acceptanceResult = buildMemberAcceptanceData(
      body.acceptance,
      memberNo
    );
    if ("error" in acceptanceResult) {
      return acceptanceResult.error;
    }

    const principal = await prisma.$transaction(async (tx) => {
      const upserted = await upsertPrincipalApplicant(tx, principalResult.data!);

      if (bioResult.data) {
        await upsertMemberInfo(tx, {
          ...bioResult.data,
          memberNo,
          familyNo,
        });
      }

      if (medicalResult.data) {
        await upsertMemberMedical(tx, {
          ...medicalResult.data,
          memberNo,
        });
      }

      if (benefitsResult.data) {
        await syncMemberBenefits(tx, memberNo, benefitsResult.data);
      }

      if (coverHistoryResult.data) {
        await syncMemberAnniversaries(tx, memberNo, coverHistoryResult.data);
      }

      if (acceptanceResult.data) {
        await upsertMemberAcceptance(tx, {
          ...acceptanceResult.data,
          memberNo,
        });
      }

      return upserted;
    });

    return NextResponse.json(principal, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medical/members failed:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A member with this number already exists" },
        { status: 409 }
      );
    }
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to create member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
