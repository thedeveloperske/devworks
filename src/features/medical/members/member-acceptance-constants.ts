import type {
  MemberAcceptanceField,
  MemberAcceptanceFormData,
} from "./member-acceptance-types";

export const defaultMemberAcceptanceForm: MemberAcceptanceFormData = {
  memberNo: "",
  status: "",
  statusDate: "",
  comments: "",
  userId: "",
  dateEntered: "",
  defRej: "",
};

export const memberAcceptanceFields = [
  { name: "memberNo", label: "Member No" },
  { name: "status", label: "Status *", required: true },
  { name: "statusDate", label: "Status Date", type: "date" },
  { name: "comments", label: "Comments" },
  { name: "userId", label: "User ID" },
  { name: "dateEntered", label: "Date Entered", type: "date" },
  { name: "defRej", label: "Reason" },
] satisfies MemberAcceptanceField[];

export const memberAcceptanceFieldNames: (keyof MemberAcceptanceFormData)[] = [
  "memberNo",
  "status",
  "statusDate",
  "comments",
  "defRej",
];

export function getMemberAcceptanceFields(
  names: (keyof MemberAcceptanceFormData)[]
): MemberAcceptanceField[] {
  const byName = new Map(
    memberAcceptanceFields.map((field) => [field.name, field])
  );
  return names.flatMap((name) => {
    const field = byName.get(name);
    return field ? [field] : [];
  });
}
