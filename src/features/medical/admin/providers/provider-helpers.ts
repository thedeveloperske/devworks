import { NextResponse } from "next/server";
import type { ProviderFormData, ProviderInput } from "./types";

function trimOrNull(value?: string | null, maxLength?: number) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (maxLength != null && trimmed.length > maxLength) {
    return trimmed.slice(0, maxLength);
  }
  return trimmed;
}

function parseOptionalInt(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseApproved(value?: string | null) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed === "1" || trimmed === "true" || trimmed === "yes") return true;
  if (trimmed === "0" || trimmed === "false" || trimmed === "no") return false;
  return null;
}

export function buildProviderData(body: ProviderInput) {
  if (!body.provider?.trim()) {
    return {
      error: NextResponse.json({ error: "Provider name is required" }, { status: 400 }),
    };
  }

  return {
    data: {
      provider: body.provider.trim(),
      country: parseOptionalInt(body.country),
      pinNo: trimOrNull(body.pinNo, 50),
      phoneNo: trimOrNull(body.phoneNo, 50),
      mobileNo: trimOrNull(body.mobileNo, 50),
      email: trimOrNull(body.email, 255),
      address: trimOrNull(body.address, 255),
      town: parseOptionalInt(body.town),
      physicalLoc: trimOrNull(body.physicalLoc, 255),
      contactPerson: trimOrNull(body.contactPerson, 255),
      telNo: trimOrNull(body.telNo, 50),
      bankAcct: trimOrNull(body.bankAcct, 50),
      bank: trimOrNull(body.bank, 50),
      mapped: trimOrNull(body.mapped, 50),
      bankBranch: trimOrNull(body.bankBranch, 50),
      status: trimOrNull(body.status, 50),
      approved: parseApproved(body.approved),
    },
  };
}

export function providerToFormValues(provider: {
  provider: string;
  country: number | null;
  pinNo: string | null;
  phoneNo: string | null;
  mobileNo: string | null;
  email: string | null;
  address: string | null;
  town: number | null;
  physicalLoc: string | null;
  contactPerson: string | null;
  telNo: string | null;
  bankAcct: string | null;
  bank: string | null;
  mapped: string | null;
  bankBranch: string | null;
  status: string | null;
  approved: boolean | null;
}): ProviderFormData {
  return {
    provider: provider.provider,
    country: provider.country != null ? String(provider.country) : "",
    pinNo: provider.pinNo ?? "",
    phoneNo: provider.phoneNo ?? "",
    mobileNo: provider.mobileNo ?? "",
    email: provider.email ?? "",
    address: provider.address ?? "",
    town: provider.town != null ? String(provider.town) : "",
    physicalLoc: provider.physicalLoc ?? "",
    contactPerson: provider.contactPerson ?? "",
    telNo: provider.telNo ?? "",
    bankAcct: provider.bankAcct ?? "",
    bank: provider.bank ?? "",
    mapped: provider.mapped ?? "",
    bankBranch: provider.bankBranch ?? "",
    status: provider.status ?? "",
    approved:
      provider.approved == null ? "" : provider.approved ? "1" : "0",
  };
}
