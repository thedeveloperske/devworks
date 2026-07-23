import { NextResponse } from "next/server";
import type { HospitalWardFormData, HospitalWardInput } from "./types";

function parseCode(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (!/^\d{1,2}$/.test(raw)) return null;
  const code = Number(raw);
  if (!Number.isInteger(code) || code < 0 || code > 99) return null;
  return code;
}

function normalizeWard(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 50);
}

export function formatHospitalWardCode(code: { toString(): string } | number | string) {
  return String(code).replace(/\.0+$/, "");
}

export function buildHospitalWardData(body: HospitalWardInput) {
  const code = parseCode(body.code);
  if (code === null) {
    return {
      error: NextResponse.json(
        { error: "Code is required and must be a number from 0 to 99" },
        { status: 400 }
      ),
    };
  }

  const ward = normalizeWard(body.ward);
  if (!ward) {
    return {
      error: NextResponse.json({ error: "Ward is required" }, { status: 400 }),
    };
  }

  return {
    data: { code, ward },
  };
}

export function hospitalWardToFormValues(item: {
  code: { toString(): string } | number | string;
  ward: string;
}): HospitalWardFormData {
  return {
    code: formatHospitalWardCode(item.code),
    ward: item.ward,
  };
}

export function hospitalWardToListItem(item: {
  code: { toString(): string } | number | string;
  ward: string;
}) {
  const code = formatHospitalWardCode(item.code);
  return {
    id: code,
    code,
    ward: item.ward,
  };
}
