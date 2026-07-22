export const ADMIN_SYSTEMS = {
  medical: {
    id: "medical",
    label: "Medical",
    basePath: "/admin/medical",
    description: "Corporate management and renewals for medical insurance.",
  },
  general: {
    id: "general",
    label: "General",
    basePath: "/admin/general",
    description: "General insurance administration and underwriting.",
  },
  aviation: {
    id: "aviation",
    label: "Aviation",
    basePath: "/admin/aviation",
    description: "Aviation insurance policies and claims.",
  },
} as const;

export type AdminSystemId = keyof typeof ADMIN_SYSTEMS;

export const ADMIN_SYSTEM_IDS = Object.keys(ADMIN_SYSTEMS) as AdminSystemId[];

/** Prisma / form codes → session system ids */
export const SYSTEM_ACCESS_TO_ID: Record<string, AdminSystemId> = {
  MEDICAL: "medical",
  GENERAL: "general",
  AVIATION: "aviation",
  medical: "medical",
  general: "general",
  aviation: "aviation",
};

export function adminSystemPath(system: AdminSystemId, path = "") {
  const base = ADMIN_SYSTEMS[system].basePath;
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function resolveAllowedSystems(allowedSystems: string[]): AdminSystemId[] {
  const unique = new Set<AdminSystemId>();
  for (const raw of allowedSystems) {
    const system = SYSTEM_ACCESS_TO_ID[String(raw).trim()];
    if (system) unique.add(system);
  }
  return ADMIN_SYSTEM_IDS.filter((id) => unique.has(id));
}

/** Extract system id from a path like `/admin/medical/claims`. */
export function systemIdFromPath(pathname: string): AdminSystemId | null {
  const match = pathname.match(/^\/admin\/(medical|general|aviation)(\/|$)/);
  if (!match) return null;
  return match[1] as AdminSystemId;
}

export function hasSystemAccess(
  allowedSystems: AdminSystemId[],
  system: string | null | undefined
) {
  if (!system) return false;
  return allowedSystems.includes(system as AdminSystemId);
}

export const MEDICAL_ADMIN_BASE = ADMIN_SYSTEMS.medical.basePath;
