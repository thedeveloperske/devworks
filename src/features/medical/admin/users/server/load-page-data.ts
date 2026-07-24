import type { LookupOption } from "@/features/medical/lookups/types";
import type { UserListItem } from "../types";
import { userToListItem } from "../user-helpers";
import { USER_STATUS_ACTIVE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loadUserOptions(): Promise<LookupOption[]> {
  const users = await prisma.user.findMany({
    where: {
      status: USER_STATUS_ACTIVE,
      username: { not: null },
    },
    select: { username: true },
    orderBy: [{ username: "asc" }],
  });

  return users
    .map((row) => {
      const username = row.username?.trim() ?? "";
      if (!username) return null;
      return {
        value: username,
        label: username,
      };
    })
    .filter((option): option is LookupOption => option != null);
}

export async function loadUsersPageData() {
  const users = await prisma.user.findMany({
    orderBy: [{ fullName: "asc" }, { username: "asc" }, { id: "asc" }],
  });

  const rows: UserListItem[] = users.map(userToListItem);
  return { users: rows };
}
