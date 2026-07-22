export type UserListItem = {
  id: string;
  username: string | null;
  fullName: string | null;
  department: string | null;
  status: string | null;
};

export type UserFormData = {
  username: string;
  fullName: string;
  password: string;
  department: string;
  status: string;
};

export const defaultUserForm = (): UserFormData => ({
  username: "",
  fullName: "",
  password: "",
  department: "",
  status: "1",
});

export const USER_STATUS_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
] as const;
