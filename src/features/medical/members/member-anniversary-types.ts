export type MemberAnniversaryFormData = {
  memberNo: string;
  anniv: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  userId: string;
  dateEntered: string;
  sync: string;
  renewalNotes: string;
  invoiceNo: string;
  commisRate: string;
  whtaxRate: string;
  sumInsured: string;
  statusUser: string;
  status: string;
  smartSync: string;
  branch: string;
  unitManager: string;
};

export type MemberAnniversaryField = {
  name: keyof MemberAnniversaryFormData;
  label: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
};
