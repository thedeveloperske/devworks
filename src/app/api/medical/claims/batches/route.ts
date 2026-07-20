import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildClaimsBatchCreateData, nextBatchNo } from "@/features/medical/claims/batching";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

async function resolveBatchUserDefault() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  return session?.name ?? session?.email ?? undefined;
}
export async function GET() {
  const batches = await prisma.claimsBatch.findMany({
    orderBy: [{ batchDate: "desc" }, { idx: "desc" }],
  });
  return NextResponse.json(batches);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const batchUserDefault = await resolveBatchUserDefault();
    const result = buildClaimsBatchCreateData(body, batchUserDefault);

    if ("error" in result) {
      return result.error;
    }

    const createData = { ...result.data };
    if (!createData.batchNo) {
      createData.batchNo = await nextBatchNo(() => prisma.claimsBatch.count());
    }
    if (!createData.batchUser && batchUserDefault) {
      createData.batchUser = batchUserDefault;
    }

    const batch = await prisma.claimsBatch.create({ data: createData });
    return NextResponse.json(batch, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create claims batch" }, { status: 500 });
  }
}
