export type MemberAcceptanceFormData = {
  memberNo: string;
  status: string;
  statusDate: string;
  comments: string;
  userId: string;
  dateEntered: string;
  defRej: string;
};

export type MemberAcceptanceField = {
  name: keyof MemberAcceptanceFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
};
