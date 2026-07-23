export type HospitalWardFormData = {
  code: string;
  ward: string;
};

export type HospitalWardInput = {
  code?: string | number;
  ward?: string;
};

export type HospitalWardListItem = {
  id: string;
  code: string;
  ward: string;
};

export type HospitalWardField = {
  name: keyof HospitalWardFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
