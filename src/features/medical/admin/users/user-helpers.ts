import type { User } from "@/generated/prisma/client";
import type { UserFormData, UserListItem } from "./types";

export function userToListItem(row: User): UserListItem {
  return {
    id: String(row.id),
    username: row.username,
    fullName: row.fullName,
    department: row.department != null ? String(row.department) : null,
    status: row.status != null ? String(row.status) : null,
  };
}

export function userToFormValues(row: {
  username?: string | null;
  fullName?: string | null;
  department?: number | null;
  status?: number | null;
}): UserFormData {
  return {
    username: row.username ?? "",
    fullName: row.fullName ?? "",
    password: "",
    department: row.department != null ? String(row.department) : "",
    status: row.status != null ? String(row.status) : "1",
  };
}

export function statusLabel(status: string | null) {
  if (status === "1") return "Active";
  if (status === "0") return "Inactive";
  return status ?? "—";
}
