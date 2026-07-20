export type ClaimsBatchListItem = {
  id: string;
  batchNo: string | null;
  batchDate: string | null;
  batchUser: string | null;
  claimsCount: string | null;
  providerCode: string | null;
  providerName: string | null;
  dateReceived: string | null;
  dataEntryUser: string | null;
  dateEntryDate: string | null;
  vettingUser: string | null;
  vettingUserDate: string | null;
  authorisingUser: string | null;
  authorisingUserDate: string | null;
  financeUser: string | null;
  financeUserDate: string | null;
};

export type ClaimsBatchFormData = {
  batchNo: string;
  batchDate: string;
  batchUser: string;
  claimsCount: string;
  provider: string;
  dateReceived: string;
  dataEntryUser: string;
  dateEntryDate: string;
  vettingUser: string;
  vettingUserDate: string;
  authorisingUser: string;
  authorisingUserDate: string;
  financeUser: string;
  financeUserDate: string;
};

export const defaultClaimsBatchForm = (): ClaimsBatchFormData => ({
  batchNo: "",
  batchDate: new Date().toISOString().slice(0, 10),
  batchUser: "",
  claimsCount: "0",
  provider: "",
  dateReceived: new Date().toISOString().slice(0, 10),
  dataEntryUser: "",
  dateEntryDate: "",
  vettingUser: "",
  vettingUserDate: "",
  authorisingUser: "",
  authorisingUserDate: "",
  financeUser: "",
  financeUserDate: "",
});
