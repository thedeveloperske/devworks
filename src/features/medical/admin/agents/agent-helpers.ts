import { NextResponse } from "next/server";
import type { AgentFormData, AgentInput } from "./types";

function trimOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function parseBranch(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function buildAgentData(body: AgentInput) {
  if (!body.agentName?.trim()) {
    return {
      error: NextResponse.json({ error: "Agent name is required" }, { status: 400 }),
    };
  }

  return {
    data: {
      agentName: body.agentName.trim(),
      mobileNo: trimOrNull(body.mobileNo),
      email: trimOrNull(body.email),
      contactPerson: trimOrNull(body.contactPerson),
      telNo: trimOrNull(body.telNo),
      branch: parseBranch(body.branch),
      pinNumber: trimOrNull(body.pinNumber),
    },
  };
}

export function agentToFormValues(agent: {
  agentName: string;
  mobileNo: string | null;
  email: string | null;
  contactPerson: string | null;
  telNo: string | null;
  branch: number | null;
  pinNumber: string | null;
}): AgentFormData {
  return {
    agentName: agent.agentName,
    mobileNo: agent.mobileNo ?? "",
    email: agent.email ?? "",
    contactPerson: agent.contactPerson ?? "",
    telNo: agent.telNo ?? "",
    branch: agent.branch != null ? String(agent.branch) : "",
    pinNumber: agent.pinNumber ?? "",
  };
}
