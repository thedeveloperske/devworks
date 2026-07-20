import { NextResponse } from "next/server";
import { buildAgentData } from "@/features/medical/admin/agents";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { agentName: "asc" },
  });
  return NextResponse.json(agents);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = buildAgentData(body);

    if ("error" in result) {
      return result.error;
    }

    const agent = await prisma.agent.create({
      data: result.data,
    });

    return NextResponse.json(agent, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}
