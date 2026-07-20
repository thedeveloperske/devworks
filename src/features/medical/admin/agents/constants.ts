import type { AgentField, AgentFormData } from "./types";

export const defaultAgentForm: AgentFormData = {
  agentName: "",
  mobileNo: "",
  email: "",
  contactPerson: "",
  telNo: "",
  branch: "",
  pinNumber: "",
};

export const agentFields: AgentField[] = [
  { name: "agentName", label: "Agent Name *", required: true },
  { name: "mobileNo", label: "Mobile No" },
  { name: "email", label: "Email", type: "email" },
  { name: "contactPerson", label: "Contact Person" },
  { name: "telNo", label: "Tel No" },
  { name: "branch", label: "Branch" },
  { name: "pinNumber", label: "PIN Number" },
];

export const agentFieldNames: (keyof AgentFormData)[] = [
  "agentName",
  "mobileNo",
  "email",
  "contactPerson",
  "telNo",
  "branch",
  "pinNumber",
];

export function getAgentFields(names: (keyof AgentFormData)[]) {
  return agentFields.filter((field) => names.includes(field.name));
}
