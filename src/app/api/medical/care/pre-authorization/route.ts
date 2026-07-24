import { NextResponse } from "next/server";
import { buildPreAuthorizationData } from "@/features/medical/care/pre-authorization";
import { assertDateReportedInMemberCoverPeriod } from "@/features/medical/care/pre-authorization/server/assert-cover-period";
import { buildClaimsReserveFromPreAuthorization } from "@/features/medical/care/pre-authorization/server/create-claims-reserve";
import {
  resolveSessionUsername,
  todayUtcDate,
} from "@/features/medical/care/pre-authorization/server/resolve-session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.preAuthorization.findMany({
    orderBy: { code: "desc" },
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildPreAuthorizationData(body);

    if ("error" in result) {
      return result.error;
    }

    const coverError = await assertDateReportedInMemberCoverPeriod({
      memberNo: result.data.memberNo,
      anniv: result.data.anniv,
      dateReported: result.data.dateReported,
    });
    if (coverError) return coverError;

    const authorizedBy = await resolveSessionUsername();

    const row = await prisma.$transaction(async (tx) => {
      const preAuth = await tx.preAuthorization.create({
        data: {
          ...result.data,
          dateAuthorized: todayUtcDate(),
          authorizedBy,
        },
      });

      const reserveData = await buildClaimsReserveFromPreAuthorization(preAuth);
      await tx.claimsReserve.create({
        data: reserveData,
      });

      return preAuth;
    });

    return NextResponse.json(row, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medical/care/pre-authorization failed:", error);
    return NextResponse.json(
      { error: "Failed to create pre-authorization" },
      { status: 500 }
    );
  }
}
