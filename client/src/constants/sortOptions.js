import i18n from "../i18n";

export const getSortOptions = () => [
  { value: "name", label: i18n.t("sortOptions.byName") },
  { value: "status", label: i18n.t("sortOptions.byStatus") },
  { value: "created_at", label: i18n.t("sortOptions.byCreatedAt") },
  { value: "updated_at", label: i18n.t("sortOptions.byUpdatedAt") },
];

export const SORT_OPTIONS = [
  { value: "name", label: "By Name" },
  { value: "status", label: "By Status" },
  { value: "created_at", label: "Created Date" },
  { value: "updated_at", label: "Updated Date" },
];

export const SORT_ORDER = {
  ASC: "asc",
  DESC: "desc",
};
