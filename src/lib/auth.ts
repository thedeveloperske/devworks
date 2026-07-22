import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveAllowedSystems } from "@/lib/admin-systems";
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
  type SessionUser,
} from "@/lib/auth-session";

export { resolveAllowedSystems } from "@/lib/admin-systems";

const scryptAsync = promisify(scrypt);

/** Active status value in the `users` table. */
export const USER_STATUS_ACTIVE = 1;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  // Promed hashed format: salt:hex
  if (stored.includes(":")) {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;

    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashBuf = Buffer.from(hash, "hex");
    if (derived.length !== hashBuf.length) return false;
    return timingSafeEqual(derived, hashBuf);
  }

  // Legacy plain-text passwords in imported `users` rows.
  const a = Buffer.from(password);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function authenticateUser(username: string, password: string) {
  const login = username.trim();
  if (!login || !password) return null;

  const users = await prisma.user.findMany({
    where: {
      username: { equals: login, mode: "insensitive" },
      status: USER_STATUS_ACTIVE,
    },
    take: 5,
  });

  const user = users.find((row) => row.username?.trim().toLowerCase() === login.toLowerCase());
  if (!user || !user.password) return null;

  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;

  const allowedSystems = resolveAllowedSystems(user.allowedSystems);
  if (allowedSystems.length === 0) return null;

  return {
    userId: String(user.id),
    // Session still uses `email` for the login identifier (username here).
    email: user.username?.trim() || login,
    name: user.fullName?.trim() || user.username?.trim() || login,
    role: "USER",
    allowedSystems,
  };
}

export async function createUserSession(user: Omit<SessionUser, "exp">) {
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

export function stripPasswordHash<T extends { password?: string | null; passwordHash?: string }>(
  user: T
) {
  const safe = { ...user };
  delete safe.password;
  delete safe.passwordHash;
  return safe;
}
