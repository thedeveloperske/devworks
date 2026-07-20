export type ProviderFormData = {
  provider: string;
  country: string;
  pinNo: string;
  phoneNo: string;
  mobileNo: string;
  email: string;
  address: string;
  town: string;
  physicalLoc: string;
  contactPerson: string;
  telNo: string;
  bankAcct: string;
  bank: string;
  mapped: string;
  bankBranch: string;
  status: string;
  approved: string;
};

export type ProviderInput = {
  provider?: string;
  country?: string;
  pinNo?: string;
  phoneNo?: string;
  mobileNo?: string;
  email?: string;
  address?: string;
  town?: string;
  physicalLoc?: string;
  contactPerson?: string;
  telNo?: string;
  bankAcct?: string;
  bank?: string;
  mapped?: string;
  bankBranch?: string;
  status?: string;
  approved?: string;
};

export type ProviderListItem = {
  id: string;
  provider: string;
  mobileNo: string | null;
  email: string | null;
  town: string | null;
  contactPerson: string | null;
  status: string | null;
  approved: boolean | null;
};

export type ProviderField = {
  name: keyof ProviderFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
