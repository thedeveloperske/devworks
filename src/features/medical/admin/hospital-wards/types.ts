export type HospitalWardFormData = {
  ward: string;
};

export type HospitalWardInput = {
  ward?: string;
};

export type HospitalWardListItem = {
  id: string;
  code: number;
  ward: string;
};

export type HospitalWardField = {
  name: keyof HospitalWardFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
