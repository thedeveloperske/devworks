export type AssignAuthorizerFormData = {
  authorizerUser: string;
  assignedDate: string;
};

export const defaultAssignAuthorizerForm = (): AssignAuthorizerFormData => ({
  authorizerUser: "",
  assignedDate: new Date().toISOString().slice(0, 10),
});
