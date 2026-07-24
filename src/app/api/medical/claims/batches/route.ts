import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildClaimsBatchCreateData, nextBatchNo } from "@/features/medical/claims/batching";
import { resolveSystemUsername } from "@/features/medical/claims/batching/resolve-system-username";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

async function resolveBatchUserDefault() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return undefined;

  if (session.userId) {
    const userId = Number.parseInt(session.userId, 10);
    if (!Number.isNaN(userId)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      const username = user?.username?.trim();
      if (username) return username;
    }
  }

  // Session `email` holds the login username as a fallback.
  return (await resolveSystemUsername(session.email)) ?? session.email ?? undefined;
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
    // Always persist the signed-in username, never a display/full name from the client.
    if (batchUserDefault) {
      createData.batchUser = batchUserDefault;
    }

    const batch = await prisma.claimsBatch.create({ data: createData });
    return NextResponse.json(batch, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create claims batch" }, { status: 500 });
  }
}
