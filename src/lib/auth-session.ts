import type { AdminSystemId } from "@/lib/admin-systems";
import { isSecureRequest } from "@/lib/app-url";

export const SESSION_COOKIE = "promed_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  userId: string;
  email: string;
  name: string;
  role: string;
  allowedSystems: AdminSystemId[];
  exp: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "promed-dev-auth-secret-change-me";
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function signData(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function signSessionToken(payload: Omit<SessionUser, "exp">): Promise<string> {
  const exp = Date.now() + SESSION_MAX_AGE_MS;
  const data = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ ...payload, exp })));
  const signature = await signData(data);
  return `${data}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionUser | null> {
  if (!token) return null;

  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = await signData(data);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const session = JSON.parse(new TextDecoder().decode(base64UrlDecode(data))) as SessionUser;
    if (!session.exp || session.exp < Date.now()) return null;
    if (!session.userId || !session.email || !Array.isArray(session.allowedSystems)) return null;
    return session;
  } catch {
    return null;
  }
}

function parseEnvFlag(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().replace(/^["']|["']$/g, "").toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
  if (normalized === "false" || normalized === "0" || normalized === "no") return false;
  return undefined;
}

export function sessionCookieOptions(
  maxAgeSeconds = SESSION_MAX_AGE_MS / 1000,
  request?: Pick<Request, "url"> & { headers: Headers }
) {
  const envFlag = parseEnvFlag(process.env.AUTH_COOKIE_SECURE);
  let secure: boolean;
  if (envFlag !== undefined) {
    secure = envFlag;
  } else if (request) {
    secure = isSecureRequest(request);
  } else {
    secure = process.env.NODE_ENV === "production";
  }

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
