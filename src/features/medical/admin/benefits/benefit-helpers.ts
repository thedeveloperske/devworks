import { NextResponse } from "next/server";
import type { BenefitFormData, BenefitInput } from "./types";

function parseBeneClass(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null };
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) {
    return { error: "Bene class must be a whole number" };
  }
  return { value: parsed };
}

export function buildBenefitData(body: BenefitInput) {
  if (!body.benefit?.trim()) {
    return {
      error: NextResponse.json({ error: "Benefit is required" }, { status: 400 }),
    };
  }

  const beneClassResult = parseBeneClass(body.beneClass);
  if ("error" in beneClassResult) {
    return {
      error: NextResponse.json({ error: beneClassResult.error }, { status: 400 }),
    };
  }

  return {
    data: {
      benefit: body.benefit.trim(),
      beneClass: beneClassResult.value,
    },
  };
}

export function benefitToFormValues(benefit: {
  benefit: string;
  beneClass: number | null;
}): BenefitFormData {
  return {
    benefit: benefit.benefit,
    beneClass: benefit.beneClass != null ? String(benefit.beneClass) : "",
  };
}
