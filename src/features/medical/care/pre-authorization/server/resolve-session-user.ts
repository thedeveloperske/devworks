import { cookies } from "next/headers";
import { resolveSystemUsername } from "@/features/medical/claims/batching/resolve-system-username";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";

/** Resolves the logged-in username (max 10 chars for legacy varchar fields). */
export async function resolveSessionUsername(maxLength = 10) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(
    cookieStore.get(SESSION_COOKIE)?.value
  );
  if (!session) return null;

  if (session.userId) {
    const userId = Number.parseInt(session.userId, 10);
    if (!Number.isNaN(userId)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      const username = user?.username?.trim();
      if (username) return username.slice(0, maxLength);
    }
  }

  const resolved = await resolveSystemUsername(session.email);
  const fallback = resolved ?? session.email ?? null;
  return fallback?.trim().slice(0, maxLength) || null;
}

export function todayUtcDate() {
  return new Date(new Date().toISOString().slice(0, 10));
}
