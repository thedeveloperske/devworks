import type { UserFormData, UserListItem, SystemAccessCode } from "./types";

const SYSTEM_CODES = new Set<SystemAccessCode>(["MEDICAL", "GENERAL", "AVIATION"]);

export function normalizeAllowedSystems(
  value: unknown
): SystemAccessCode[] {
  if (!Array.isArray(value)) return [];
  const unique = new Set<SystemAccessCode>();
  for (const item of value) {
    const code = String(item).trim().toUpperCase() as SystemAccessCode;
    if (SYSTEM_CODES.has(code)) unique.add(code);
  }
  return Array.from(unique);
}

export function userToListItem(row: {
  id: number;
  username: string | null;
  fullName: string | null;
  department: number | null;
  status: number | null;
  allowedSystems?: SystemAccessCode[] | string[] | null;
}): UserListItem {
  return {
    id: String(row.id),
    username: row.username,
    fullName: row.fullName,
    department: row.department != null ? String(row.department) : null,
    status: row.status != null ? String(row.status) : null,
    allowedSystems: normalizeAllowedSystems(row.allowedSystems),
  };
}

export function userToFormValues(row: {
  username?: string | null;
  fullName?: string | null;
  department?: number | null;
  status?: number | null;
  allowedSystems?: SystemAccessCode[] | string[] | null;
}): UserFormData {
  return {
    username: row.username ?? "",
    fullName: row.fullName ?? "",
    password: "",
    department: row.department != null ? String(row.department) : "",
    status: row.status != null ? String(row.status) : "1",
    allowedSystems: normalizeAllowedSystems(row.allowedSystems),
  };
}

export function statusLabel(status: string | null) {
  if (status === "1") return "Active";
  if (status === "0") return "Inactive";
  return status ?? "—";
}

export function systemsLabel(systems: SystemAccessCode[]) {
  if (systems.length === 0) return "—";
  return systems
    .map((code) => {
      if (code === "MEDICAL") return "Medical";
      if (code === "GENERAL") return "General";
      if (code === "AVIATION") return "Aviation";
      return code;
    })
    .join(", ");
}
