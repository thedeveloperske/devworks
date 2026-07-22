import type { UserListItem } from "../types";
import { userToListItem } from "../user-helpers";
import { prisma } from "@/lib/prisma";

export async function loadUsersPageData() {
  const users = await prisma.user.findMany({
    orderBy: [{ fullName: "asc" }, { username: "asc" }, { id: "asc" }],
  });

  const rows: UserListItem[] = users.map(userToListItem);
  return { users: rows };
}
