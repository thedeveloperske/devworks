import { NextResponse } from "next/server";
import { allocateNextFamilyNo } from "@/features/medical/members";
import { prisma } from "@/lib/prisma";

/** Preview next family + principal member numbers for a corporate (does not create). */
export async function GET(request: Request) {
  const corpId = new URL(request.url).searchParams.get("corpId");
  const result = await allocateNextFamilyNo(prisma, corpId);
  if ("error" in result) {
    return result.error;
  }
  return NextResponse.json(result);
}
