export type ServiceFormData = {
  service: string;
};

export type ServiceInput = {
  service?: string;
};

export type ServiceListItem = {
  id: string;
  code: number;
  service: string;
};

export type ServiceField = {
  name: keyof ServiceFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
