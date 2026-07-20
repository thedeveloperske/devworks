export const ADMIN_SYSTEMS = {
  medical: {
    id: "medical",
    label: "Medical",
    basePath: "/admin/medical",
  },
} as const;

export type AdminSystemId = keyof typeof ADMIN_SYSTEMS;

export function adminSystemPath(system: AdminSystemId, path = "") {
  const base = ADMIN_SYSTEMS[system].basePath;
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const MEDICAL_ADMIN_BASE = ADMIN_SYSTEMS.medical.basePath;
