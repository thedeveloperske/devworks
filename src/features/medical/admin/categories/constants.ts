import type { CategoryTypeField, CategoryTypeFormData } from "./types";

export const defaultCategoryTypeForm: CategoryTypeFormData = {
  category: "",
};

export const categoryTypeFields = [
  { name: "category", label: "Category *", required: true, placeholder: "e.g. A" },
] satisfies CategoryTypeField[];

export const categoryTypeFieldNames: (keyof CategoryTypeFormData)[] = ["category"];

export function getCategoryTypeFields(names: (keyof CategoryTypeFormData)[]) {
  return categoryTypeFields.filter((field) => names.includes(field.name));
}
