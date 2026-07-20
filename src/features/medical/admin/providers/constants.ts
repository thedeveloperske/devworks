import type { ProviderField, ProviderFormData } from "./types";

export const defaultProviderForm: ProviderFormData = {
  provider: "",
  country: "",
  pinNo: "",
  phoneNo: "",
  mobileNo: "",
  email: "",
  address: "",
  town: "",
  physicalLoc: "",
  contactPerson: "",
  telNo: "",
  bankAcct: "",
  bank: "",
  mapped: "",
  bankBranch: "",
  status: "",
  approved: "",
};

export const providerFields = [
  { name: "provider", label: "Provider Name *", required: true },
  { name: "pinNo", label: "PIN No" },
  { name: "mobileNo", label: "Mobile No" },
  { name: "phoneNo", label: "Phone No" },
  { name: "telNo", label: "Tel No" },
  { name: "email", label: "Email", type: "email" },
  { name: "contactPerson", label: "Contact Person" },
  { name: "address", label: "Address" },
  { name: "physicalLoc", label: "Physical Location" },
  { name: "town", label: "Town" },
  { name: "country", label: "Country", type: "number" },
  { name: "bank", label: "Bank" },
  { name: "bankAcct", label: "Bank Account" },
  { name: "bankBranch", label: "Bank Branch" },
  { name: "mapped", label: "Mapped" },
  { name: "status", label: "Status" },
  { name: "approved", label: "Approved" },
] satisfies ProviderField[];

export const providerFieldNames: (keyof ProviderFormData)[] = [
  "provider",
  "pinNo",
  "mobileNo",
  "phoneNo",
  "telNo",
  "email",
  "contactPerson",
  "address",
  "physicalLoc",
  "town",
  "country",
  "bank",
  "bankAcct",
  "bankBranch",
  "mapped",
  "status",
  "approved",
];

export function getProviderFields(names: (keyof ProviderFormData)[]) {
  return providerFields.filter((field) => names.includes(field.name));
}
