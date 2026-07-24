import { USER_STATUS_ACTIVE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Resolve a submitted user value to the canonical `users.username`.
 * Returns null when the value is not an active system username.
 */
export async function resolveSystemUsername(
  value: string | undefined | null
): Promise<string | null> {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const user = await prisma.user.findFirst({
    where: {
      username: { equals: trimmed, mode: "insensitive" },
      status: USER_STATUS_ACTIVE,
    },
    select: { username: true },
  });

  const username = user?.username?.trim();
  return username || null;
}
