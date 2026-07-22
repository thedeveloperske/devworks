export type SystemAccessCode = "MEDICAL" | "GENERAL" | "AVIATION";

export type UserListItem = {
  id: string;
  username: string | null;
  fullName: string | null;
  department: string | null;
  status: string | null;
  allowedSystems: SystemAccessCode[];
};

export type UserFormData = {
  username: string;
  fullName: string;
  password: string;
  department: string;
  status: string;
  allowedSystems: SystemAccessCode[];
};

export const defaultUserForm = (): UserFormData => ({
  username: "",
  fullName: "",
  password: "",
  department: "",
  status: "1",
  allowedSystems: ["MEDICAL"],
});

export const USER_STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
] as const;

export const SYSTEM_ACCESS_OPTIONS: Array<{
  value: SystemAccessCode;
  label: string;
}> = [
  { value: "MEDICAL", label: "Medical" },
  { value: "GENERAL", label: "General" },
  { value: "AVIATION", label: "Aviation" },
];
