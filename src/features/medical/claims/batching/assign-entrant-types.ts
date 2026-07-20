export type AssignEntrantFormData = {
  entrantUser: string;
  assignedDate: string;
};

export const defaultAssignEntrantForm = (): AssignEntrantFormData => ({
  entrantUser: "",
  assignedDate: new Date().toISOString().slice(0, 10),
});
