export type AgentFormData = {
  agentName: string;
  mobileNo: string;
  email: string;
  contactPerson: string;
  telNo: string;
  branch: string;
  pinNumber: string;
};

export type AgentInput = {
  agentName?: string;
  mobileNo?: string;
  email?: string;
  contactPerson?: string;
  telNo?: string;
  branch?: string;
  pinNumber?: string;
};

export type AgentListItem = {
  id: string;
  agentName: string;
  mobileNo: string | null;
  email: string | null;
  contactPerson: string | null;
  telNo: string | null;
  branch: string | null;
  pinNumber: string | null;
};

export type AgentField = {
  name: keyof AgentFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
};
