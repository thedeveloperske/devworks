export type AssignFinanceFormData = {
  financeUser: string;
  assignedDate: string;
};

export const defaultAssignFinanceForm = (): AssignFinanceFormData => ({
  financeUser: "",
  assignedDate: new Date().toISOString().slice(0, 10),
});
