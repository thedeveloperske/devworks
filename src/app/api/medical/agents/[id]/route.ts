import { NextResponse } from "next/server";
import { buildAgentData } from "@/features/medical/admin/agents";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function parseAgentId(id: string) {
  const agentId = Number.parseInt(id, 10);
  if (Number.isNaN(agentId)) {
    return null;
  }
  return agentId;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const agentId = parseAgentId(id);

  if (agentId == null) {
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({
    where: { agentId },
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(agent);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const agentId = parseAgentId(id);

  if (agentId == null) {
    return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = buildAgentData(body);

    if ("error" in result) {
      return result.error;
    }

    const agent = await prisma.agent.update({
      where: { agentId },
      data: result.data,
    });

    return NextResponse.json(agent);
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}
