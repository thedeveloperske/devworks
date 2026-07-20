import { NextResponse } from "next/server";
import {
  buildMemberAcceptanceData,
  buildMemberAnniversariesData,
  buildMemberBenefitsData,
  buildMemberInfoData,
  buildMemberMedicalData,
  buildPrincipalApplicantData,
  memberAcceptanceToFormValues,
  memberAnniversaryToFormValues,
  memberBenefitToFormValues,
  memberInfoToFormValues,
  memberInfoToFamilyDependantRow,
  memberMedicalToFormValues,
  principalApplicantToFormValues,
  syncMemberAnniversaries,
  syncMemberBenefits,
  upsertMemberAcceptance,
  upsertMemberInfo,
  upsertMemberMedical,
  upsertPrincipalApplicant,
} from "@/features/medical/members";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id: memberNo } = await params;

  const principalApplicant = await prisma.principalApplicant.findUnique({
    where: { memberNo },
  });

  if (!principalApplicant) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const [
    memberInfo,
    memberMedical,
    memberBenefits,
    memberAnniversaries,
    memberAcceptance,
    corporate,
  ] = await Promise.all([
    prisma.memberInfo.findUnique({
      where: { memberNo },
    }),
    prisma.memberMedical.findFirst({
      where: { memberNo },
      orderBy: { anniv: "desc" },
    }),
    prisma.memberBenefit.findMany({
      where: { memberNo },
      orderBy: [{ anniv: "desc" }, { benefit: "asc" }],
    }),
    prisma.memberAnniversary.findMany({
      where: { memberNo },
      orderBy: { anniv: "desc" },
    }),
    prisma.memberAcceptance.findUnique({
      where: { memberNo },
    }),
    principalApplicant.corpId
      ? prisma.corporate.findUnique({
          where: { corpId: principalApplicant.corpId },
          select: { id: true, corporate: true, corpId: true },
        })
      : Promise.resolve(null),
  ]);

  const familyNo =
    memberInfo?.familyNo?.trim() ||
    principalApplicant.familyNo?.trim() ||
    "";

  const dependantInfos = familyNo
    ? await prisma.memberInfo.findMany({
        where: {
          familyNo,
          NOT: { memberNo },
        },
        orderBy: [{ surname: "asc" }, { firstName: "asc" }],
      })
    : [];

  const principalInformation =
    principalApplicantToFormValues(principalApplicant);

  return NextResponse.json({
    id: principalApplicant.memberNo,
    memberNumber: principalApplicant.memberNo,
    firstName: principalApplicant.firstName ?? "",
    lastName: principalApplicant.surname ?? "",
    email: principalApplicant.email,
    phone: principalApplicant.mobileNo || principalApplicant.telNo,
    corporateId: corporate?.id ?? "",
    corporate: corporate
      ? {
          corporate: corporate.corporate,
          corpId: corporate.corpId,
        }
      : null,
    principalInformation,
    bioData: memberInfo ? memberInfoToFormValues(memberInfo) : null,
    medicalDetails: memberMedical
      ? memberMedicalToFormValues(memberMedical)
      : null,
    benefits: memberBenefits.map(memberBenefitToFormValues),
    coverHistory: memberAnniversaries.map(memberAnniversaryToFormValues),
    acceptance: memberAcceptance
      ? memberAcceptanceToFormValues(memberAcceptance)
      : null,
    dependants: dependantInfos.map(memberInfoToFamilyDependantRow),
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id: memberNo } = await params;

  try {
    const existing = await prisma.principalApplicant.findUnique({
      where: { memberNo },
      select: { memberNo: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await request.json();
    const principalResult = buildPrincipalApplicantData({
      ...body.principalInformation,
      memberNo,
    });
    if ("error" in principalResult) {
      return principalResult.error;
    }

    const bioResult = buildMemberInfoData(
      body.bioData,
      memberNo,
      principalResult.data?.familyNo,
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
      const upserted = await upsertPrincipalApplicant(tx, {
        ...principalResult.data!,
        memberNo,
      });

      if (bioResult.data) {
        await upsertMemberInfo(tx, {
          ...bioResult.data,
          memberNo,
          familyNo: bioResult.data.familyNo || principalResult.data!.familyNo,
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

    return NextResponse.json(principal);
  } catch (error: unknown) {
    console.error("PUT /api/medical/members/[id] failed:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
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
        : "Failed to update member";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH() {
  return NextResponse.json(
    {
      error:
        "Member status is not stored on principal_applicant. Status updates are unavailable.",
    },
    { status: 501 }
  );
}
