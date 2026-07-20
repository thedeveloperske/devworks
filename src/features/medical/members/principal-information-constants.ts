import type {
  PrincipalInformationField,
  PrincipalInformationFormData,
} from "./principal-information-types";

export const defaultPrincipalInformationForm: PrincipalInformationFormData = {
  familyNo: "",
  memberNo: "",
  surname: "",
  firstName: "",
  otherNames: "",
  agentId: "",
  corpId: "",
  employer: "",
  telNo: "",
  mobileNo: "",
  postalAdd: "",
  town: "",
  email: "",
  phyLoc: "",
  familySize: "",
  relationToFamily: "",
  individual: "",
  businessClass: "",
  dateFormReceived: "",
  witnessed: "",
  dateWitnessed: "",
  userId: "",
  dateEntered: "",
  province: "",
  formFilled: "",
  department: "",
  insurer: "",
  category: "",
  maritalStatus: "",
  dateEmployed: "",
  previousInsurer: "",
  periodInsured: "",
  beneficiary: "",
  beneficiaryId: "",
  beneficiaryRelation: "",
  policyNo: "",
  pinNo: "",
  branch: "",
  shareData: "",
};

export const principalInformationFields: PrincipalInformationField[] = [
  { name: "familyNo", label: "Family No" },
  { name: "memberNo", label: "Member No" },
  { name: "surname", label: "Surname *", required: true },
  { name: "firstName", label: "First Name *", required: true },
  { name: "otherNames", label: "Other Names" },
  { name: "agentId", label: "Intermediary" },
  { name: "corpId", label: "Corporate" },
  { name: "employer", label: "Employer" },
  { name: "telNo", label: "Tel No" },
  { name: "mobileNo", label: "Mobile No" },
  { name: "postalAdd", label: "Postal Address" },
  { name: "town", label: "Town" },
  { name: "email", label: "Email", type: "email" },
  { name: "phyLoc", label: "Physical Location" },
  { name: "familySize", label: "Family Size" },
  { name: "relationToFamily", label: "Relation to Family", type: "number" },
  { name: "individual", label: "Individual" },
  { name: "businessClass", label: "Business Class" },
  { name: "dateFormReceived", label: "Date Form Received", type: "date" },
  { name: "witnessed", label: "Witnessed" },
  { name: "dateWitnessed", label: "Date Witnessed", type: "date" },
  { name: "userId", label: "User ID" },
  { name: "dateEntered", label: "Date Entered", type: "date" },
  { name: "province", label: "Province", type: "number" },
  { name: "formFilled", label: "Form Filled" },
  { name: "department", label: "Department", type: "number" },
  { name: "insurer", label: "Insurer", type: "number" },
  { name: "category", label: "Category *", required: true },
  { name: "maritalStatus", label: "Marital Status", type: "number" },
  { name: "dateEmployed", label: "Date Employed", type: "date" },
  { name: "previousInsurer", label: "Previous Insurer" },
  { name: "periodInsured", label: "Period Insured" },
  { name: "beneficiary", label: "Beneficiary" },
  { name: "beneficiaryId", label: "Beneficiary ID" },
  { name: "beneficiaryRelation", label: "Beneficiary Relation" },
  { name: "policyNo", label: "Policy No" },
  { name: "pinNo", label: "PIN No" },
  { name: "branch", label: "Branch" },
  { name: "shareData", label: "Share Data" },
];

export const principalInformationFieldNames: (keyof PrincipalInformationFormData)[] =
  [
    "category",
    "businessClass",
    "policyNo",
    "branch",
    "familyNo",
    "memberNo",
    "firstName",
    "otherNames",
    "surname",
    "familySize",
    "postalAdd",
    "town",
    "mobileNo",
    "telNo",
    "email",
    "phyLoc",
    "agentId",
    "corpId",
  ];

export function getPrincipalInformationFields(
  names: (keyof PrincipalInformationFormData)[]
): PrincipalInformationField[] {
  const byName = new Map(
    principalInformationFields.map((field) => [field.name, field])
  );
  return names.flatMap((name) => {
    const field = byName.get(name);
    return field ? [field] : [];
  });
}
