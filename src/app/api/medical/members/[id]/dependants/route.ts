import { NextResponse } from "next/server";
import {
  allocateNextDependantMemberNo,
  buildMemberAcceptanceData,
  buildMemberAnniversariesData,
  buildMemberBenefitsData,
  buildMemberInfoData,
  buildMemberMedicalData,
  memberInfoToFamilyDependantRow,
  syncMemberAnniversaries,
  syncMemberBenefits,
  upsertMemberAcceptance,
  upsertMemberInfo,
  upsertMemberMedical,
} from "@/features/medical/members";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: principalMemberNo } = await params;
    const trimmedPrincipalNo = principalMemberNo?.trim();
    if (!trimmedPrincipalNo) {
      return NextResponse.json(
        { error: "Principal member number is required" },
        { status: 400 }
      );
    }

    const principal = await prisma.principalApplicant.findUnique({
      where: { memberNo: trimmedPrincipalNo },
      select: {
        memberNo: true,
        familyNo: true,
        corpId: true,
        category: true,
        idx: true,
      },
    });

    if (!principal) {
      return NextResponse.json(
        { error: "Principal not found" },
        { status: 404 }
      );
    }

    const familyNo = principal.familyNo?.trim();
    if (!familyNo) {
      return NextResponse.json(
        { error: "Principal family number is missing" },
        { status: 400 }
      );
    }

    // A cancelled principal (member_info.cancelled = 1) cannot take dependants.
    const principalInfo = await prisma.memberInfo.findUnique({
      where: { memberNo: trimmedPrincipalNo },
      select: { cancelled: true },
    });
    if (principalInfo?.cancelled === 1) {
      return NextResponse.json(
        {
          error:
            "This principal is cancelled. Reinstate them before adding dependants.",
        },
        { status: 409 }
      );
    }

    const body = await request.json();
    const corpId =
      body.bioData?.corpId?.trim() || principal.corpId?.trim() || undefined;

    const allocated = await allocateNextDependantMemberNo(prisma, familyNo);
    if ("error" in allocated) {
      return allocated.error;
    }
    const memberNo = allocated.memberNo;

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

      const familyCount = await tx.memberInfo.count({
        where: { familyNo },
      });
      await tx.principalApplicant.update({
        where: { idx: principal.idx },
        data: { familySize: familyCount },
      });
    });

    return NextResponse.json(
      {
        memberNo,
        familyNo,
        dependant: memberInfoToFamilyDependantRow(bioResult.data),
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/medical/members/[id]/dependants failed:", error);
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
        : "Failed to create dependant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
