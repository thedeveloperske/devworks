import { NextResponse } from "next/server";
import type { HospitalWardFormData, HospitalWardInput } from "./types";

function normalizeWard(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 50);
}

export function buildHospitalWardData(body: HospitalWardInput) {
  const ward = normalizeWard(body.ward);
  if (!ward) {
    return {
      error: NextResponse.json({ error: "Ward is required" }, { status: 400 }),
    };
  }

  return {
    data: { ward },
  };
}

export function hospitalWardToFormValues(item: {
  ward: string;
}): HospitalWardFormData {
  return {
    ward: item.ward,
  };
}

export function hospitalWardToListItem(item: {
  code: number;
  ward: string;
}) {
  return {
    id: String(item.code),
    code: item.code,
    ward: item.ward,
  };
}
