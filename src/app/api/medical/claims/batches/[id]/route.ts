import { NextResponse } from "next/server";
import {
  batchToFormValues,
  buildClaimsBatchUpdateData,
} from "@/features/medical/claims/batching";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseBatchId(id: string) {
  const batchId = Number.parseInt(id, 10);
  if (Number.isNaN(batchId)) {
    return null;
  }
  return batchId;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const batchId = parseBatchId(id);

  if (batchId == null) {
    return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
  }

  const batch = await prisma.claimsBatch.findUnique({
    where: { idx: batchId },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...batch,
    form: batchToFormValues(batch),
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const batchId = parseBatchId(id);

  if (batchId == null) {
    return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildClaimsBatchUpdateData(body);

    if ("error" in result) {
      return result.error;
    }

    const batch = await prisma.claimsBatch.update({
      where: { idx: batchId },
      data: result.data,
    });

    return NextResponse.json(batch);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update claims batch" }, { status: 500 });
  }
}
