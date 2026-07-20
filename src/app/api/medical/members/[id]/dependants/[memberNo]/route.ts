import { NextResponse } from "next/server";
import {
  buildMemberAcceptanceData,
  buildMemberAnniversariesData,
  buildMemberBenefitsData,
  buildMemberInfoData,
  buildMemberMedicalData,
  memberAcceptanceToFormValues,
  memberAnniversaryToFormValues,
  memberBenefitToFormValues,
  memberInfoToFormValues,
  memberMedicalToFormValues,
  syncMemberAnniversaries,
  syncMemberBenefits,
  upsertMemberAcceptance,
  upsertMemberInfo,
  upsertMemberMedical,
} from "@/features/medical/members";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string; memberNo: string }> };

async function loadDependantContext(principalMemberNo: string, memberNo: string) {
  const principal = await prisma.principalApplicant.findUnique({
    where: { memberNo: principalMemberNo },
    select: { memberNo: true, familyNo: true, corpId: true },
  });
  if (!principal) {
    return {
      error: NextResponse.json({ error: "Principal not found" }, { status: 404 }),
    };
  }

  // Resolve the family number the same way the principal GET does:
  // member_info first, then principal_applicant.
  const principalInfo = await prisma.memberInfo.findUnique({
    where: { memberNo: principalMemberNo },
    select: { familyNo: true },
  });
  const familyNo =
    principalInfo?.familyNo?.trim() || principal.familyNo?.trim() || "";
  if (!familyNo) {
    return {
      error: NextResponse.json(
        { error: "Principal family number is missing" },
        { status: 404 }
      ),
    };
  }

  const memberInfo = await prisma.memberInfo.findUnique({
    where: { memberNo },
  });
  if (!memberInfo || memberInfo.familyNo?.trim() !== familyNo) {
    return {
      error: NextResponse.json({ error: "Dependant not found" }, { status: 404 }),
    };
  }

  return { principal, memberInfo };
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id, memberNo } = await params;
  const context = await loadDependantContext(id.trim(), memberNo.trim());
  if ("error" in context) return context.error;

  const { principal, memberInfo } = context;

  const [memberMedical, memberBenefits, memberAnniversaries, memberAcceptance] =
    await Promise.all([
      prisma.memberMedical.findFirst({
        where: { memberNo: memberInfo.memberNo },
        orderBy: { anniv: "desc" },
      }),
      prisma.memberBenefit.findMany({
        where: { memberNo: memberInfo.memberNo },
        orderBy: [{ anniv: "desc" }, { benefit: "asc" }],
      }),
      prisma.memberAnniversary.findMany({
        where: { memberNo: memberInfo.memberNo },
        orderBy: { anniv: "desc" },
      }),
      prisma.memberAcceptance.findUnique({
        where: { memberNo: memberInfo.memberNo },
      }),
    ]);

  return NextResponse.json({
    memberNo: memberInfo.memberNo,
    familyNo: memberInfo.familyNo,
    principalMemberNo: principal.memberNo,
    corpId: memberInfo.corpId || principal.corpId,
    bioData: memberInfoToFormValues(memberInfo),
    medicalDetails: memberMedical
      ? memberMedicalToFormValues(memberMedical)
      : null,
    benefits: memberBenefits.map(memberBenefitToFormValues),
    coverHistory: memberAnniversaries.map(memberAnniversaryToFormValues),
    acceptance: memberAcceptance
      ? memberAcceptanceToFormValues(memberAcceptance)
      : null,
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id, memberNo: rawMemberNo } = await params;
    const context = await loadDependantContext(id.trim(), rawMemberNo.trim());
    if ("error" in context) return context.error;

    const { principal, memberInfo } = context;
    const memberNo = memberInfo.memberNo;
    const familyNo = memberInfo.familyNo;

    const body = await request.json();
    const corpId =
      body.bioData?.corpId?.trim() ||
      memberInfo.corpId?.trim() ||
      principal.corpId?.trim() ||
      undefined;

    const bioResult = buildMemberInfoData(
      {
        ...body.bioData,
        familyNo,
        memberNo,
        corpId,
      },
      memberNo,
      familyNo,
      corpId
    );
    if ("error" in bioResult) {
      return bioResult.error;
    }
    if (!bioResult.data) {
      return NextResponse.json(
        { error: "Bio data is required for dependants" },
        { status: 400 }
      );
    }

    const medicalResult = buildMemberMedicalData(body.medicalDetails, memberNo);
    if ("error" in medicalResult) {
      return medicalResult.error;
    }

    const benefitsResult = buildMemberBenefitsData(
      body.benefits,
      memberNo,
      corpId
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

    await prisma.$transaction(async (tx) => {
      await upsertMemberInfo(tx, {
        ...bioResult.data!,
        memberNo,
        familyNo,
      });

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
    });

    return NextResponse.json({ memberNo, familyNo });
  } catch (error: unknown) {
    console.error(
      "PUT /api/medical/members/[id]/dependants/[memberNo] failed:",
      error
    );
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to update dependant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
