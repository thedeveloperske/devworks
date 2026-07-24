import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDateReportedCoverPeriodError } from "../pre-authorization-helpers";

export async function assertDateReportedInMemberCoverPeriod(args: {
  memberNo: string;
  anniv: string | null;
  dateReported: Date | null;
}) {
  if (!args.dateReported) return null;

  const dateIso = args.dateReported.toISOString().slice(0, 10);
  if (!args.anniv) {
    return NextResponse.json(
      { error: "Anniv is required when date reported is set" },
      { status: 400 }
    );
  }

  const anniv = Number(args.anniv);
  if (!Number.isFinite(anniv)) {
    return NextResponse.json({ error: "Invalid anniv" }, { status: 400 });
  }

  const anniversary = await prisma.memberAnniversary.findUnique({
    where: {
      memberNo_anniv: {
        memberNo: args.memberNo,
        anniv,
      },
    },
    select: { startDate: true, endDate: true },
  });

  if (!anniversary) {
    return NextResponse.json(
      {
        error: `No member anniversary found for ${args.memberNo} (anniv ${args.anniv})`,
      },
      { status: 400 }
    );
  }

  const error = getDateReportedCoverPeriodError(dateIso, {
    startDate: anniversary.startDate
      ? anniversary.startDate.toISOString().slice(0, 10)
      : "",
    endDate: anniversary.endDate
      ? anniversary.endDate.toISOString().slice(0, 10)
      : "",
  });

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return null;
}
