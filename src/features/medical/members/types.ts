import type { LookupOption } from "@/features/medical/lookups/types";

export type MemberFormData = {
  memberNumber: string;
  firstName: string;
  lastName: string;
  corporateId: string;
  memberType: string;
  principalId: string;
  email: string;
  phone: string;
  status: string;
  dateOfBirth: string;
};

export type MemberInput = {
  memberNumber?: string;
  firstName?: string;
  lastName?: string;
  corporateId?: string;
  memberType?: string;
  principalId?: string;
  email?: string;
  phone?: string;
  status?: string;
  dateOfBirth?: string;
};

export type MemberListItem = {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  corporateId: string;
  corporateName: string;
  memberType: string;
  status: string;
  phone: string | null;
  email: string | null;
};

export type SavedMemberSummary = {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  corporateId: string;
  phone: string | null;
  email: string | null;
};

export type PrincipalOption = {
  id: string;
  corporateId: string;
  label: string;
};

export type MembersCorpGroupBenefit = {
  category: string;
  anniv: string;
  benefit: string;
  policyLimit: string;
  sharing: string;
  subLimitOf: string;
  waitingPeriod: string;
};

export type MembersCorporateOption = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
  branch: string | null;
  businessClass: string | null;
  agentId: string | null;
  anniv: string;
  endDate: string;
  renewalDate: string;
  categoryOptions: LookupOption[];
  /** Benefits from corp_groups for this corporate (latest anniv). */
  corpGroupBenefits: MembersCorpGroupBenefit[];
};

export type MemberField = {
  name: keyof MemberFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
};

/** Row on the Member Status page — one per member (principal or dependant). */
export type MemberStatusRow = {
  memberNo: string;
  familyNo: string;
  name: string;
  corporateId: string;
  corporateName: string;
  memberType: "Principal" | "Dependant";
  /** Latest cover anniversary number, "" when the member has no cover history. */
  anniv: string;
  /** Current status code from member_anniversary.status, "" when unset. */
  status: string;
  /** member_info.cancelled — 1 when cancelled, 0/null otherwise. */
  cancelled: number | null;
};

export type MemberStatusCorporate = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
};

/** Row on the Renew Members page — one per member (principal or dependant). */
export type MemberRenewRow = {
  memberNo: string;
  familyNo: string;
  name: string;
  corporateId: string;
  memberType: "Principal" | "Dependant";
  /** Latest cover anniversary number, "" when the member has no cover history. */
  anniv: string;
  /** End date of the member's latest cover period, "" when unknown. */
  endDate: string;
  /** member_info.cancelled — 1 when cancelled, 0/null otherwise. */
  cancelled: number | null;
};

/** Corporate option on the Renew Members page, with its current cover period. */
export type MemberRenewCorporate = {
  id: string;
  corporate: string;
  corpId: string | null;
  policyNo: string | null;
  /** Latest corp_anniversary number, "" when the corporate has no cover history. */
  corpAnniv: string;
  corpStartDate: string;
  corpEndDate: string;
  corpRenewalDate: string;
};
