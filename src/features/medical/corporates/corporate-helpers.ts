import { NextResponse } from "next/server";
import type { CorporateFormData, CorporateInput } from "./types";

function trimOrNull(value?: string | null, uppercase = false) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return uppercase ? trimmed.toUpperCase() : trimmed;
}

export function buildPolicyNo(corpId: string, year = new Date().getFullYear()) {
  return `POL-00${corpId}${year}`;
}

export function buildCorporateData(body: CorporateInput) {
  if (!body.corporate?.trim()) {
    return {
      error: NextResponse.json(
        { error: "Corporate name is required" },
        { status: 400 }
      ),
    };
  }
  return {
    data: {
      businessClass: trimOrNull(body.businessClass),
      scheme: trimOrNull(body.scheme, true),
      corporate: body.corporate.trim(),
      telNo: trimOrNull(body.telNo),
      mobileNo: trimOrNull(body.mobileNo),
      email: trimOrNull(body.email),
      town: trimOrNull(body.town),
      physicalLocation: trimOrNull(body.physicalLocation),
      agentId: trimOrNull(body.agentId),
      branch: trimOrNull(body.branch),
      currency: trimOrNull(body.currency),
      channel: trimOrNull(body.channel),
    },
  };
}

export function corporateToFormValues(corporate: {
  policyNo: string | null;
  businessClass: string | null;
  scheme: string | null;
  corporate: string;
  corpId: string | null;
  telNo: string | null;
  mobileNo: string | null;
  email: string | null;
  town: string | null;
  physicalLocation: string | null;
  agentId: string | null;
  branch: string | null;
  currency: string | null;
  channel: string | null;
}): CorporateFormData {
  return {
    policyNo: corporate.policyNo ?? "",
    businessClass: corporate.businessClass ?? "",
    scheme: (corporate.scheme ?? "").toUpperCase(),
    corporate: (corporate.corporate).toUpperCase(),
    corpId: corporate.corpId ?? "",
    telNo: corporate.telNo ?? "",
    mobileNo: corporate.mobileNo ?? "",
    email: corporate.email ?? "",
    town: corporate.town ?? "",
    physicalLocation: corporate.physicalLocation ?? "",
    agentId: corporate.agentId ?? "",
    branch: corporate.branch ?? "",
    currency: corporate.currency ?? "",
    channel: corporate.channel ?? "",
  };
}
