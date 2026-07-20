import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MEMBER_CANCEL_REASONS,
  MEMBER_REINSTATE_REASONS,
} from "@/features/medical/lookups";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

const STATUS_BY_ACTION = {
  cancel: 3,
  reinstate: 1,
} as const;

type StatusAction = keyof typeof STATUS_BY_ACTION;
type StatusScope = "member" | "family";

function isStatusAction(value: string): value is StatusAction {
  return value === "cancel" || value === "reinstate";
}

function isStatusScope(value: string): value is StatusScope {
  return value === "member" || value === "family";
}

function parseRequiredDate(value: string) {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { error: "Date must be YYYY-MM-DD" };
  }
  const parsed = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "Invalid date" };
  }
  return { value: parsed };
}

function resolveReason(action: StatusAction, reasonKey: string) {
  const reasons =
    action === "cancel" ? MEMBER_CANCEL_REASONS : MEMBER_REINSTATE_REASONS;
  return reasons.find((item) => item.key === reasonKey) ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = String(body.action ?? "").trim();
    const scope = String(body.scope ?? "").trim();
    const memberNo = String(body.memberNo ?? "").trim();
    const reason = String(body.reason ?? "").trim();
    const dateRaw = String(body.date ?? "").trim();

    if (!isStatusAction(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!isStatusScope(scope)) {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }
    if (!memberNo) {
      return NextResponse.json(
        { error: "Member number is required" },
        { status: 400 }
      );
    }

    const resolvedReason = resolveReason(action, reason);
    if (!resolvedReason) {
      return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
    }
    const reasonCode = Number(resolvedReason.key);

    const dateResult = parseRequiredDate(dateRaw);
    if ("error" in dateResult) {
      return NextResponse.json({ error: dateResult.error }, { status: 400 });
    }
    const actionDate = dateResult.value;

    let memberNos: string[] = [];

    if (scope === "member") {
      memberNos = [memberNo];
    } else {
      const info = await prisma.memberInfo.findUnique({
        where: { memberNo },
        select: { familyNo: true },
      });
      if (!info?.familyNo?.trim()) {
        return NextResponse.json(
          { error: "Member family not found" },
          { status: 404 }
        );
      }
      const family = await prisma.memberInfo.findMany({
        where: { familyNo: info.familyNo },
        select: { memberNo: true },
      });
      memberNos = family.map((member) => member.memberNo);
    }

    if (memberNos.length === 0) {
      return NextResponse.json(
        { error: "No members found for the selected scope" },
        { status: 404 }
      );
    }

    // Latest anniversary per member — status lives on member_anniversary.
    const latestAnnivs = await prisma.memberAnniversary.groupBy({
      by: ["memberNo"],
      where: { memberNo: { in: memberNos } },
      _max: { anniv: true },
    });

    const status = STATUS_BY_ACTION[action];
    const cookieStore = await cookies();
    const session = await verifySessionToken(
      cookieStore.get(SESSION_COOKIE)?.value
    );
    const statusUser = session?.email?.slice(0, 15) ?? null;
    const userId = session?.email?.slice(0, 10) ?? null;

    const updates = latestAnnivs.filter((row) => row._max.anniv != null);
    // member_cancellation.cancelled: 1 = cancelled, 0 = reinstated.
    const cancelled = action === "cancel" ? 1 : 0;
    const latestAnnivByMemberNo = new Map(
      updates.map((row) => [row.memberNo, row._max.anniv!])
    );
    const today = new Date(new Date().toISOString().slice(0, 10));

    await prisma.$transaction([
      prisma.memberCancellation.createMany({
        data: memberNos.map((no) => ({
          memberNo: no,
          cancelled,
          dateCan: actionDate,
          anniv: latestAnnivByMemberNo.get(no) ?? null,
          reason: reasonCode,
          userId,
          dateEntered: today,
        })),
      }),
      ...updates.map((row) =>
        prisma.memberAnniversary.update({
          where: {
            memberNo_anniv: {
              memberNo: row.memberNo,
              anniv: row._max.anniv!,
            },
          },
          data: { status, statusUser },
        })
      ),
      prisma.memberInfo.updateMany({
        where: { memberNo: { in: memberNos } },
        data: { cancelled },
      }),
    ]);

    const updatedMemberNos = updates.map((row) => row.memberNo);

    return NextResponse.json({
      status: String(status),
      cancelled,
      updated: updatedMemberNos.length,
      skipped: memberNos.length - updatedMemberNos.length,
      memberNos: updatedMemberNos,
      targetMemberNos: memberNos,
    });
  } catch (error: unknown) {
    console.error("POST /api/medical/members/status failed:", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to update member status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
