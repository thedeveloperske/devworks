import type { LookupOption } from "@/features/medical/lookups/types";
import type { AgentListItem } from "../types";
import { prisma } from "@/lib/prisma";

export async function loadAgentOptions(): Promise<LookupOption[]> {
  const agents = await prisma.agent.findMany({
    select: { agentId: true, agentName: true },
    orderBy: { agentName: "asc" },
  });

  return agents.map((agent) => ({
    value: String(agent.agentId),
    label: agent.agentName,
  }));
}

export async function loadAgentsPageData() {
  const agents = await prisma.agent.findMany({
    select: {
      agentId: true,
      agentName: true,
      mobileNo: true,
      email: true,
      contactPerson: true,
      telNo: true,
      branch: true,
      pinNumber: true,
    },
    orderBy: { agentName: "asc" },
  });

  const rows: AgentListItem[] = agents.map((agent) => ({
    id: String(agent.agentId),
    agentName: agent.agentName,
    mobileNo: agent.mobileNo,
    email: agent.email,
    contactPerson: agent.contactPerson,
    telNo: agent.telNo,
    branch: agent.branch != null ? String(agent.branch) : null,
    pinNumber: agent.pinNumber,
  }));

  return { agents: rows };
}
