import { RESOURCE_TYPES } from "../constants/resourceTypes";

export const isDashboardFrontend = (resource) => {
  const name = resource.name?.toLowerCase() || "";
  return name.includes("dashboard");
};

export const filterResources = (resources, activeView) => {
  switch (activeView) {
    case "applications":
      return resources.filter((r) => r.type === RESOURCE_TYPES.APPLICATION);
    case "services":
      return resources.filter((r) => r.type === RESOURCE_TYPES.SERVICE);
    case "databases":
      return resources.filter((r) => r.type === RESOURCE_TYPES.DATABASE);
    default:
      return [];
  }
};

export const filterDashboardResources = (resources) => {
  return resources.filter((resource) => !isDashboardFrontend(resource));
};

export const searchResources = (resources, searchTerm) => {
  if (!searchTerm) return resources;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(lowerSearchTerm) ||
      (resource.description &&
        resource.description.toLowerCase().includes(lowerSearchTerm)) ||
      (resource.fqdns &&
        resource.fqdns.some((url) =>
          url.toLowerCase().includes(lowerSearchTerm)
        ))
  );
};

export const sortResources = (resources, sortBy, sortOrder) => {
  return [...resources].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "name":
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case "status":
        aVal = a.status || "";
        bVal = b.status || "";
        break;
      case "created_at":
        aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
        bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
        break;
      case "updated_at":
        aVal = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        bVal = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterAndSortResources = (
  resources,
  activeView,
  searchTerm,
  sortBy,
  sortOrder
) => {
  let filtered = filterResources(resources, activeView);
  filtered = searchResources(filtered, searchTerm);
  return sortResources(filtered, sortBy, sortOrder);
};
