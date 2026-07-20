import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AdminSystemId } from "@/lib/admin-systems";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
  type SessionUser,
} from "@/lib/auth-session";

const scryptAsync = promisify(scrypt);

const SYSTEM_ACCESS_TO_ID: Record<string, AdminSystemId> = {
  MEDICAL: "medical",
};

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashBuf = Buffer.from(hash, "hex");
  if (derived.length !== hashBuf.length) return false;
  return timingSafeEqual(derived, hashBuf);
}

export function resolveAllowedSystems(
  role: string,
  allowedSystems: string[]
): AdminSystemId[] {
  if (role === "SUPER_ADMIN") {
    return ["medical"];
  }

  return allowedSystems
    .map((system) => SYSTEM_ACCESS_TO_ID[system])
    .filter((system): system is AdminSystemId => Boolean(system));
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.adminUser.findFirst({
    where: { email: { equals: email.trim(), mode: "insensitive" } },
  });
  if (!user || user.status !== "ACTIVE" || !user.passwordHash) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const allowedSystems = resolveAllowedSystems(user.role, user.allowedSystems);
  if (allowedSystems.length === 0) return null;

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    allowedSystems,
  };
}

export async function createUserSession(
  user: Omit<SessionUser, "exp">
) {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(0), maxAge: 0 });
}

export function stripPasswordHash<T extends { passwordHash?: string }>(user: T) {
  const safe = { ...user };
  delete safe.passwordHash;
  return safe;
}
