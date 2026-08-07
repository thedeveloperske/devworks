import { NextResponse } from "next/server";
import {
  buildCreateClaimData,
  type CreateClaimInput,
} from "@/features/medical/claims/manage/claim-helpers";
import { buildClaimsReserveDebitFromClaim } from "@/features/medical/claims/manage/server/create-claims-reserve-debit";
import { generateNextClaimNo } from "@/features/medical/claims/manage/server/generate-claim-no";
import {
  resolveSessionUsername,
  todayUtcDate,
} from "@/features/medical/care/pre-authorization/server/resolve-session-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateClaimInput;
    const result = buildCreateClaimData(body);

    if ("error" in result) {
      return result.error;
    }

    const { data } = result;
    const userId = await resolveSessionUsername();
    const dateEntered = todayUtcDate();

    const existingBill = await prisma.bill.findUnique({
      where: { invoiceNo: String(data.bill.invoiceNo) },
      select: { invoiceNo: true },
    });
    if (existingBill) {
      return NextResponse.json(
        { error: `Invoice no ${data.bill.invoiceNo} already exists` },
        { status: 409 }
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const claimNo = await generateNextClaimNo(tx);
      const claimFormNo = claimNo.slice(0, 15);

      const bill = await tx.bill.create({
        data: {
          ...data.bill,
          claimNo,
          claimFormNo,
          userId,
          dateEntered,
        },
      });

      const claimForm = await tx.claimForm.create({
        data: {
          ...data.claimForm,
          claimNo,
          userId,
          dateEntered,
        },
      });

      if (data.diagnoses.length > 0) {
        await tx.memberDiagnosis.createMany({
          data: data.diagnoses.map((row) => ({
            ...row,
            claimNo,
          })),
        });
      }

      if (data.lineItems.length > 0) {
        await tx.claimLineItem.createMany({
          data: data.lineItems.map((row) => ({
            ...row,
            claimNo,
          })),
        });
      }

      if (data.preAuthNo) {
        const reserveData = await buildClaimsReserveDebitFromClaim({
          preAuthNo: data.preAuthNo,
          memberNo: bill.memberNo,
          claimNo,
          invoiceNo: bill.invoiceNo,
          invoicedAmount: data.invoicedAmount,
          provider: String(bill.provider),
          service: String(bill.service),
          claimNature: bill.claimNature != null ? String(bill.claimNature) : null,
          anniv: bill.anniv != null ? String(bill.anniv) : null,
          batchNo: bill.batchNo,
        });
        await tx.claimsReserve.create({ data: reserveData });
      }

      return { claimNo, bill, claimForm };
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/medical/claims/manage failed:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A claim or invoice with this number already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}
