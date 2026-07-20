export type BenefitFormData = {
  benefit: string;
  beneClass: string;
};

export type BenefitInput = {
  benefit?: string;
  beneClass?: string;
};

export type BenefitListItem = {
  id: string;
  benefit: string;
  beneClass: string | null;
};

export type BenefitField = {
  name: keyof BenefitFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
