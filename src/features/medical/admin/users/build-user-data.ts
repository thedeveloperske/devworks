import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth";
import type { UserFormData } from "./types";
import { normalizeAllowedSystems } from "./user-helpers";

type BuildError = { error: NextResponse };

function badRequest(message: string): BuildError {
  return { error: NextResponse.json({ error: message }, { status: 400 }) };
}

function parseRequiredString(value: string | undefined, label: string, max = 100) {
  const trimmed = value?.trim();
  if (!trimmed) return badRequest(`${label} is required`);
  if (trimmed.length > max) {
    return badRequest(`${label} exceeds ${max} characters`);
  }
  return { value: trimmed };
}

function parseOptionalInt(value: string | undefined, label: string) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: null as number | null };
  if (!/^-?\d+$/.test(trimmed)) {
    return badRequest(`${label} must be a whole number`);
  }
  return { value: Number(trimmed) };
}

function parseStatus(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return { value: 1 };
  if (trimmed !== "0" && trimmed !== "1") {
    return badRequest("Status must be Active or Inactive");
  }
  return { value: Number(trimmed) };
}

function parseAllowedSystems(value: unknown) {
  const systems = normalizeAllowedSystems(value);
  if (systems.length === 0) {
    return badRequest("Select at least one allowed system");
  }
  return { value: systems };
}

export async function buildUserCreateData(body: Partial<UserFormData>) {
  const usernameResult = parseRequiredString(body.username, "Username");
  if ("error" in usernameResult) return usernameResult;

  const fullNameResult = parseRequiredString(body.fullName, "Full name");
  if ("error" in fullNameResult) return fullNameResult;

  const passwordRaw = body.password?.trim();
  if (!passwordRaw) return badRequest("Password is required");
  if (passwordRaw.length < 4) return badRequest("Password must be at least 4 characters");

  const departmentResult = parseOptionalInt(body.department, "Department");
  if ("error" in departmentResult) return departmentResult;

  const statusResult = parseStatus(body.status);
  if ("error" in statusResult) return statusResult;

  const systemsResult = parseAllowedSystems(body.allowedSystems);
  if ("error" in systemsResult) return systemsResult;

  const data: Prisma.UserCreateInput = {
    username: usernameResult.value,
    fullName: fullNameResult.value,
    password: await hashPassword(passwordRaw),
    department: departmentResult.value,
    status: statusResult.value,
    allowedSystems: systemsResult.value,
  };

  return { data };
}

export async function buildUserUpdateData(body: Partial<UserFormData>) {
  const usernameResult = parseRequiredString(body.username, "Username");
  if ("error" in usernameResult) return usernameResult;

  const fullNameResult = parseRequiredString(body.fullName, "Full name");
  if ("error" in fullNameResult) return fullNameResult;

  const departmentResult = parseOptionalInt(body.department, "Department");
  if ("error" in departmentResult) return departmentResult;

  const statusResult = parseStatus(body.status);
  if ("error" in statusResult) return statusResult;

  const systemsResult = parseAllowedSystems(body.allowedSystems);
  if ("error" in systemsResult) return systemsResult;

  const data: Prisma.UserUpdateInput = {
    username: usernameResult.value,
    fullName: fullNameResult.value,
    department: departmentResult.value,
    status: statusResult.value,
    allowedSystems: systemsResult.value,
  };

  const passwordRaw = body.password?.trim();
  if (passwordRaw) {
    if (passwordRaw.length < 4) return badRequest("Password must be at least 4 characters");
    data.password = await hashPassword(passwordRaw);
  }

  return { data };
}
