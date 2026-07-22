import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { ClaimsBatchFormData } from "./types";

type BuildError = { error: NextResponse };

function badRequest(message: string): BuildError {
  return { error: NextResponse.json({ error: message }, { status: 400 }) };
}

function parseRequiredDate(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return badRequest(`${label} is required`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return badRequest(`Invalid ${label.toLowerCase()}`);
  }
  const date = new Date(`${trimmed}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return badRequest(`Invalid ${label.toLowerCase()}`);
  }
  return { date };
}

function parseOptionalString(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    return badRequest(`Value exceeds maximum length of ${maxLength} characters`);
  }
  return trimmed;
}

function parseClaimsCount(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return { count: 0 };
  if (!/^\d+$/.test(trimmed)) {
    return badRequest("Claims count must be a whole number");
  }
  const count = Number.parseInt(trimmed, 10);
  if (count < 0 || count > 999) {
    return badRequest("Claims count must be between 0 and 999");
  }
  return { count };
}

function parseProvider(value: string | undefined, required: boolean) {
  const trimmed = value?.trim();
  if (!trimmed) {
    if (required) return badRequest("Provider is required");
    return { provider: null as number | null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return badRequest("Invalid provider");
  }
  const provider = Number.parseInt(trimmed, 10);
  if (provider < 1 || provider > 99999) {
    return badRequest("Invalid provider");
  }
  return { provider };
}

function isBuildError(value: unknown): value is BuildError {
  return typeof value === "object" && value !== null && "error" in value;
}

export function buildClaimsBatchCreateData(
  body: Partial<ClaimsBatchFormData>,
  batchUserDefault?: string
) {
  const batchDateResult = parseRequiredDate(body.batchDate, "Batch date");
  if (isBuildError(batchDateResult)) return batchDateResult;

  const dateReceivedResult = parseRequiredDate(body.dateReceived, "Date received");
  if (isBuildError(dateReceivedResult)) return dateReceivedResult;

  const providerResult = parseProvider(body.provider, true);
  if (isBuildError(providerResult)) return providerResult;

  const claimsCountResult = parseClaimsCount(body.claimsCount);
  if (isBuildError(claimsCountResult)) return claimsCountResult;

  const batchNoResult = parseOptionalString(body.batchNo, 10);
  if (isBuildError(batchNoResult)) return batchNoResult;

  const batchUserResult = parseOptionalString(body.batchUser ?? batchUserDefault, 100);
  if (isBuildError(batchUserResult)) return batchUserResult;

  const data: Prisma.ClaimsBatchCreateInput = {
    batchNo: batchNoResult,
    batchDate: batchDateResult.date,
    batchUser: batchUserResult,
    claimsCount: claimsCountResult.count,
    provider: providerResult.provider,
    dateReceived: dateReceivedResult.date,
  };

  return { data };
}

export function buildClaimsBatchUpdateData(body: Partial<ClaimsBatchFormData>) {
  const batchDateResult = parseRequiredDate(body.batchDate, "Batch date");
  if (isBuildError(batchDateResult)) return batchDateResult;

  const dateReceivedResult = parseRequiredDate(body.dateReceived, "Date received");
  if (isBuildError(dateReceivedResult)) return dateReceivedResult;

  const providerResult = parseProvider(body.provider, true);
  if (isBuildError(providerResult)) return providerResult;

  const claimsCountResult = parseClaimsCount(body.claimsCount);
  if (isBuildError(claimsCountResult)) return claimsCountResult;

  const batchNoResult = parseOptionalString(body.batchNo, 10);
  if (isBuildError(batchNoResult)) return batchNoResult;

  const batchUserResult = parseOptionalString(body.batchUser, 100);
  if (isBuildError(batchUserResult)) return batchUserResult;

  // Workflow assignments are updated only via dedicated assign endpoints,
  // which enforce entrant → vetter → authorizer order.
  const data: Prisma.ClaimsBatchUpdateInput = {
    batchNo: batchNoResult,
    batchDate: batchDateResult.date,
    batchUser: batchUserResult,
    claimsCount: claimsCountResult.count,
    provider: providerResult.provider,
    dateReceived: dateReceivedResult.date,
  };

  return { data };
}
