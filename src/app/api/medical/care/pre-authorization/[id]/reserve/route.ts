import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { buildClaimsReserveFromPreAuthorization } from "@/features/medical/care/pre-authorization/server/create-claims-reserve";
import {
  resolveSessionUsername,
  todayUtcDate,
} from "@/features/medical/care/pre-authorization/server/resolve-session-user";
import { stripThousands } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseCode(id: string) {
  const code = Number.parseInt(id, 10);
  if (Number.isNaN(code)) return null;
  return code;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const code = parseCode(id);

  if (code == null) {
    return NextResponse.json(
      { error: "Invalid pre-authorization code" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action === "release" ? "release" : body.action === "top-up" ? "top-up" : null;
    if (!action) {
      return NextResponse.json(
        { error: "Action must be top-up or release" },
        { status: 400 }
      );
    }

    const amountRaw = stripThousands(String(body.amount ?? ""));
    const amount = Number.parseFloat(amountRaw);
    if (!amountRaw || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid amount greater than zero" },
        { status: 400 }
      );
    }

    const amountDecimal = new Prisma.Decimal(amountRaw);
    const userId = await resolveSessionUsername();

    const updated = await prisma.$transaction(async (tx) => {
      const preAuth = await tx.preAuthorization.findUnique({
        where: { code },
      });

      if (!preAuth) {
        return null;
      }

      const currentReserve = new Prisma.Decimal(preAuth.reserve ?? 0);
      const nextReserve =
        action === "top-up"
          ? currentReserve.add(amountDecimal)
          : currentReserve.sub(amountDecimal);

      if (action === "release" && nextReserve.lessThan(0)) {
        throw new Error("RELEASE_EXCEEDS_RESERVE");
      }

      const saved = await tx.preAuthorization.update({
        where: { code },
        data: { reserve: nextReserve },
      });

      const baseReserve = await buildClaimsReserveFromPreAuthorization(saved);

      if (action === "top-up") {
        await tx.claimsReserve.create({
          data: {
            ...baseReserve,
            credit: amountDecimal,
            debit: null,
            notes: "TOP UP".slice(0, 50),
            userId,
            dateEntered: todayUtcDate(),
          },
        });
      } else {
        await tx.claimsReserve.create({
          data: {
            ...baseReserve,
            // Negative credit reduces the reserve credit ledger.
            credit: amountDecimal.negated(),
            debit: null,
            notes: "RELEASE".slice(0, 50),
            userId,
            dateEntered: todayUtcDate(),
          },
        });
      }

      return saved;
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Pre-authorization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "RELEASE_EXCEEDS_RESERVE") {
      return NextResponse.json(
        { error: "Release amount cannot exceed the current reserve" },
        { status: 400 }
      );
    }
    console.error(
      "POST /api/medical/care/pre-authorization/[id]/reserve failed:",
      error
    );
    return NextResponse.json(
      { error: "Failed to adjust reserve" },
      { status: 500 }
    );
  }
}
