export type CategoryTypeFormData = {
  category: string;
};

export type CategoryTypeInput = {
  category?: string;
};

export type CategoryTypeListItem = {
  id: string;
  category: string;
};

export type CategoryTypeField = {
  name: keyof CategoryTypeFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
