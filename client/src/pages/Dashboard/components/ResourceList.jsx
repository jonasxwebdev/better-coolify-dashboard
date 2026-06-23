import { useTranslation } from "react-i18next";
import ResourceCard from "../../../components/ResourceCard";
import { useSoundEffects } from "../../../hooks/useSoundEffects";
import { SOUND_TYPES } from "../../../utils/soundUtils";
import { CubeIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ResourceList = ({
  resources,
  sortBy,
  sortOrder,
  onSort,
  activeView,
  totalResourcesByType,
  searchTerm,
  onClearSearch,
}) => {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();

  const handleClearSearch = () => {
    playSound(SOUND_TYPES.CLICK);
    onClearSearch();
  };

  // Empty state
  if (resources.length === 0) {
    const totalCount = totalResourcesByType[activeView] || 0;
    const viewLabel =
      activeView === "applications"
        ? t("dashboard.applications")
        : activeView === "services"
          ? t("dashboard.services")
          : t("dashboard.databases");

    return (
      <div className="text-center py-12 md:py-16">
        <CubeIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">
          {totalCount === 0
            ? `${viewLabel} ${t("dashboard.noResources")}`
            : t("dashboard.noResources")}
        </p>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="cursor-pointer mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>{t("common.search")}</span>
          </button>
        )}
      </div>
    );
  }

  const columns = [
    { key: "detail", label: t("common.detail"), sortable: false, span: 1 },
    { key: "status", label: t("common.status"), sortable: true, span: 1 },
    { key: "name", label: t("common.name"), sortable: true, span: 2 },
    {
      key: "created_at",
      label: t("common.created"),
      sortable: true,
      span: 2,
      hideOnMobile: true,
    },
    {
      key: "updated_at",
      label: t("common.updated"),
      sortable: true,
      span: 2,
      hideOnMobile: true,
    },
    {
      key: "type",
      label: t("common.type"),
      sortable: false,
      span: 3,
      hideOnMobile: true,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="hidden lg:block bg-muted/40 border-b text-center border-border px-6 py-3">
        <div className="grid grid-cols-11 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`col-span-${column.span} ${
                column.hideOnMobile ? "hidden md:block" : ""
              } ${column.sortable ? "cursor-pointer hover:text-foreground transition-colors" : "text-center"}`}
              onClick={column.sortable ? () => onSort(column.key) : undefined}
            >
              {column.label}{" "}
              {column.sortable &&
                sortBy === column.key &&
                (sortOrder === "asc" ? "↑" : "↓")}
            </div>
          ))}
        </div>
      </div>

      {/* Resource Cards */}
      {resources.map((resource, index) => (
        <ResourceCard
          key={resource.uuid || resource.id || index}
          resource={resource}
        />
      ))}
    </div>
  );
};

export default ResourceList;
