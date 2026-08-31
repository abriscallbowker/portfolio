export const writingCategories = [
  {value: "personal", label: "Personal"},
  {value: "work", label: "Work"},
  {value: "projects", label: "Projects"},
] as const;

export type WritingCategory = (typeof writingCategories)[number]["value"];

export const writingFilterOptions = [
  {value: "all", label: "All"},
  ...writingCategories,
] as const;

export type WritingFilter = (typeof writingFilterOptions)[number]["value"];
