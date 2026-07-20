export type FamilyDependantRow = {
  memberNo: string;
  surname: string;
  firstName: string;
  otherNames: string;
  relationToPrincipal: string;
  gender: string;
  dob: string;
};

export const familyDependantColumns = [
  { key: "memberNo", label: "Member No" },
  { key: "surname", label: "Surname" },
  { key: "firstName", label: "First Name" },
  { key: "otherNames", label: "Other Names" },
  { key: "relationToPrincipal", label: "Relationship" },
  { key: "gender", label: "Gender" },
  { key: "dob", label: "Date of Birth" },
] as const satisfies ReadonlyArray<{
  key: keyof FamilyDependantRow;
  label: string;
}>;
