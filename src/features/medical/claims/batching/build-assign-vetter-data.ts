import { NextResponse } from "next/server";
import type { AssignVetterFormData } from "./assign-vetter-types";

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

function parseRequiredString(value: string | undefined, label: string, maxLength: number) {
  const trimmed = value?.trim();
  if (!trimmed) return badRequest(`${label} is required`);
  if (trimmed.length > maxLength) {
    return badRequest(`${label} exceeds maximum length of ${maxLength} characters`);
  }
  return { value: trimmed };
}

export function buildAssignVetterData(body: Partial<AssignVetterFormData>) {
  const vetterResult = parseRequiredString(body.vetterUser, "Vetter name", 100);
  if ("error" in vetterResult) return vetterResult;

  const assignedDateResult = parseRequiredDate(body.assignedDate, "Assignment date");
  if ("error" in assignedDateResult) return assignedDateResult;

  return {
    data: {
      vettingUser: vetterResult.value,
      vettingUserDate: assignedDateResult.date,
    },
  };
}
