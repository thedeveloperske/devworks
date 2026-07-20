export type AssignVetterFormData = {
  vetterUser: string;
  assignedDate: string;
};

export const defaultAssignVetterForm = (): AssignVetterFormData => ({
  vetterUser: "",
  assignedDate: new Date().toISOString().slice(0, 10),
});
