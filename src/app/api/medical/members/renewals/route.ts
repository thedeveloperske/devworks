import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

/**
 * Renews principals (and everyone in their families) onto the corporate's
 * current cover period: inserts member_anniversary and member_benefits only.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const corporateId = String(body.corporateId ?? "").trim();
    const memberNos: string[] = Array.isArray(body.memberNos)
      ? body.memberNos
          .map((no: unknown) => String(no).trim())
          .filter(Boolean)
      : [];

    if (!corporateId) {
      return NextResponse.json(
        { error: "Corporate is required" },
        { status: 400 }
      );
    }
    if (memberNos.length === 0) {
      return NextResponse.json(
        { error: "Select at least one principal to renew" },
        { status: 400 }
      );
    }

    const corporate = await prisma.corporate.findUnique({
      where: { id: corporateId },
      select: { corpId: true },
    });
    if (!corporate?.corpId) {
      return NextResponse.json(
        { error: "Corporate not found" },
        { status: 404 }
      );
    }

    const corpPeriod = await prisma.corpAnniversary.findFirst({
      where: { corpId: corporate.corpId },
      orderBy: { anniv: "desc" },
      select: {
        anniv: true,
        startDate: true,
        endDate: true,
        renewalDate: true,
      },
    });
    if (!corpPeriod) {
      return NextResponse.json(
        { error: "Corporate has no cover period. Renew the corporate first." },
        { status: 400 }
      );
    }

    // Resolve each selected principal's family, then renew the whole family.
    const selectedInfos = await prisma.memberInfo.findMany({
      where: { memberNo: { in: memberNos } },
      select: { memberNo: true, familyNo: true },
    });
    if (selectedInfos.length !== memberNos.length) {
      const found = new Set(selectedInfos.map((info) => info.memberNo));
      const missing = memberNos.filter((no) => !found.has(no));
      return NextResponse.json(
        { error: `Member not found: ${missing.join(", ")}` },
        { status: 404 }
      );
    }

    const familyNos = [
      ...new Set(
        selectedInfos
          .map((info) => info.familyNo?.trim())
          .filter((familyNo): familyNo is string => Boolean(familyNo))
      ),
    ];
    if (familyNos.length === 0) {
      return NextResponse.json(
        { error: "Selected members have no family number" },
        { status: 400 }
      );
    }

    const familyInfos = await prisma.memberInfo.findMany({
      where: { familyNo: { in: familyNos } },
      select: { memberNo: true, cancelled: true, familyNo: true },
    });
    const familyMemberNos = familyInfos.map((info) => info.memberNo);

    const latestAnnivs = await prisma.memberAnniversary.findMany({
      where: { memberNo: { in: familyMemberNos } },
      select: { memberNo: true, anniv: true, endDate: true },
      orderBy: { anniv: "desc" },
    });

    const latestByMemberNo = new Map<
      string,
      { anniv: number; endDate: Date | null }
    >();
    for (const row of latestAnnivs) {
      if (latestByMemberNo.has(row.memberNo)) continue;
      latestByMemberNo.set(row.memberNo, row);
    }

    const corpEndIso = corpPeriod.endDate.toISOString().slice(0, 10);

    const toRenew: string[] = [];
    let skippedCancelled = 0;
    let skippedCurrent = 0;

    for (const info of familyInfos) {
      if (info.cancelled === 1) {
        skippedCancelled += 1;
        continue;
      }
      const latest = latestByMemberNo.get(info.memberNo);
      const latestEndIso = latest?.endDate
        ? latest.endDate.toISOString().slice(0, 10)
        : "";
      // Already on the corporate's current period — nothing to renew.
      if (latestEndIso && latestEndIso === corpEndIso) {
        skippedCurrent += 1;
        continue;
      }
      toRenew.push(info.memberNo);
    }

    const cookieStore = await cookies();
    const session = await verifySessionToken(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const userId = session?.email?.slice(0, 10) ?? null;
    const statusUser = session?.email?.slice(0, 15) ?? null;
    const today = new Date(new Date().toISOString().slice(0, 10));

    const renewed: Array<{ memberNo: string; anniv: number }> = [];
    let benefitsCreated = 0;

    if (toRenew.length > 0) {
      const sourceBenefits = await prisma.memberBenefit.findMany({
        where: { memberNo: { in: toRenew } },
      });

      const nextAnnivByMemberNo = new Map<string, number>();
      const anniversaryRows = toRenew.map((memberNo) => {
        const nextAnniv = (latestByMemberNo.get(memberNo)?.anniv ?? 0) + 1;
        nextAnnivByMemberNo.set(memberNo, nextAnniv);
        renewed.push({ memberNo, anniv: nextAnniv });
        return {
          memberNo,
          anniv: nextAnniv,
          startDate: corpPeriod.startDate,
          endDate: corpPeriod.endDate,
          renewalDate: corpPeriod.renewalDate,
          status: 1,
          statusUser,
          userId,
          dateEntered: today,
        };
      });

      // Only benefits from each member's latest anniversary are renewed.
      const benefitRows = sourceBenefits
        .filter(
          (benefit) =>
            benefit.anniv === latestByMemberNo.get(benefit.memberNo)?.anniv
        )
        .map((benefit) => ({
          ...benefit,
          anniv: nextAnnivByMemberNo.get(benefit.memberNo)!,
          statusUser,
        }));

      await prisma.$transaction([
        prisma.memberAnniversary.createMany({ data: anniversaryRows }),
        prisma.memberBenefit.createMany({ data: benefitRows }),
      ]);
      benefitsCreated = benefitRows.length;
    }

    return NextResponse.json({
      renewed,
      renewedCount: renewed.length,
      benefitsCreated,
      skippedCancelled,
      skippedCurrent,
      endDate: corpEndIso,
    });
  } catch (error: unknown) {
    console.error("POST /api/medical/members/renewals failed:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to renew members";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
