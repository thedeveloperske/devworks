import type {
  ClaimDiagnosisField,
  ClaimDiagnosisFormData,
} from "./types";

export const defaultClaimDiagnosis = (args?: {
  claimNo?: string;
  memberNo?: string;
}): ClaimDiagnosisFormData => ({
  claimNo: args?.claimNo ?? "",
  memberNo: args?.memberNo ?? "",
  diagnosis: "",
});

export const claimDiagnosisFields: ClaimDiagnosisField[] = [
  {
    name: "claimNo",
    label: "Claim No",
    readOnly: true,
  },
  {
    name: "memberNo",
    label: "Member No",
    readOnly: true,
  },
  {
    name: "diagnosis",
    label: "Diagnosis *",
    type: "number",
    required: true,
  },
];
