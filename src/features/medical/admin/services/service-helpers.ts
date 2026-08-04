import { NextResponse } from "next/server";
import type { ServiceFormData, ServiceInput } from "./types";

function normalizeService(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 100);
}

export function buildServiceData(body: ServiceInput) {
  const service = normalizeService(body.service);
  if (!service) {
    return {
      error: NextResponse.json({ error: "Service is required" }, { status: 400 }),
    };
  }

  return {
    data: { service },
  };
}

export function serviceToFormValues(item: {
  service: string;
}): ServiceFormData {
  return {
    service: item.service,
  };
}

export function serviceToListItem(item: {
  code: number | { toString(): string };
  service: string;
}) {
  const code = Number(item.code);
  return {
    id: String(code),
    code,
    service: item.service,
  };
}
